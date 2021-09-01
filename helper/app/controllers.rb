require 'singleton'

require './app/models'
require './app/post/models'
require './helper/app/http404'

# 各機能アプリのControllerのベース
class AppController
  include Singleton

  attr_accessor :appname, :foreign_appnames, :foreign_columns, :model, :columns, :is_all, :select_column

  def initialize(appname, columns, foreign_appnames)
    # 機能アプリ名
    @appname = appname
    # モデルの名前
    @model = model_by_appname(appname)
    # モデルの普通のカラムのうち、作成時に使うカラム
    @columns = columns
    # 外部キーによってリレーションがある機能アプリ名
    @foreign_appnames = foreign_appnames
    # モデルの外部キーのカラム
    @foreign_columns = @foreign_appnames.map{ |el| "#{el}_id" }
    # 一覧を取得するときに、全件を取得するか
    @is_all = @foreign_appnames.count.zero?
    # 一覧を取得するときに、何のカラムを基準に検索するか
    @select_column = @is_all ? nil : "#{@foreign_appnames[0]}_id"
  end

  # サニタイジング処理を行う
  # [引数]text:処理が行われる文字列
  # [返り値]処理が行われた文字列
  def h(text)
    Rack::Utils.escape_html(text)
  end

  # HTTPリクエストからHTTPリクエストのBODYの連想配列に変換する
  # [引数]request:HTTPリクエスト
  # [返り値]HTTPリクエストのBODYの連想配列
  def request_to_request_body(request)
    JSON.parse(request.body.read).with_indifferent_access
  end

  # HTTPレスポンスのBODYの連想配列とステータスコードからレスポンスを生成する
  # [引数]boay_hash:HTTPレスポンスのBODYの連想配列
  #       status:ステータスコード
  # [返り値]HTTPレスポンス
  def generate_response(body_hash, status)
    {
      # HTTPレスポンスのBODYはJSONとして返す
      'body' => body_hash.to_json,
      'status' => status
    }
  end

  # ステータスコードが404のレスポンスを生成する
  # [引数]なし
  # [返り値]HTTPレスポンス
  def generate_404_response()
    Http404.instance.document_type - 'json'
    generate_response({}, 404)
  end

  # 特定の機能アプリのModelのレコードを取得する
  # [引数]appname:機能アプリ名
  #       params:クエリパラメータ
  # [返り値]取得したレコード
  def get_record(appname, params)
    # 機能アプリに対応するModelを取得
    model = model_by_appname(appname)
    model.find_by(id: h(params["#{appname}_id"]))
  end

  # 該当するアプリのModelのレコードを取得する
  # [引数]params:クエリパラメータ
  # [返り値]取得したレコード
  def get_main_record(params)
    get_record(@appname, params)
  end

  # 外部キーを利用して、ページが存在しないかどうが判定する
  # [引数]params:クエリパラメータ
  # [返り値]ページが存在しないかどうか
  def is_404_by_foreign(params)
    result = false

    # いずれかの外部キーの参照元のレコードが存在しない場合
    # ページが存在しないことにする
    @foreign_appnames.each do |appname|
      if get_record(appname, params).nil?
        result = true
        break
      end
    end

    result
  end

  # 検索条件に従って、レコードの一覧を取得する
  # [引数]params:クエリパラメータ
  # [返り値]HTTPレスポンス
  def list(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    # レコードの一覧を取得
    record = @is_all ? @model.all : @model.where("#{@select_column} = ?", h(params[@select_column]))

    # レコードがなかった場合
    record.nil? && record = []

    generate_response({ @appname.pluralize => record }, 200)
  end

  # 新しいレコードを作成する
  # [引数]request:HTTPリクエスト
  #       params:クエリパラメータ
  # [返り値]HTTPレスポンス
  def create(request, params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    # HTTPリクエストのBODYの連想配列
    request_body = request_to_request_body(request)

    record = @model.new

    # 普通のカラムにデータを代入する
    @columns.each do |column|
      record[column] = h(request_body[column])
    end

    # 外部キーのカラムにデータを代入する
    @foreign_columns.each do |column|
      record[column] = h(params[column])
    end

    # 新規レコードを保存
    record.save

    generate_response({ @appname => record }, 200)
  end

  # 1件のレコードを取得する
  # [引数]params:クエリパラメータ
  # [返り値]HTTPレスポンス
  def detail(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    # レコードを取得
    record = get_main_record(params)

    # レコードが存在しない場合
    if record.nil?
      return generate_404_response()
    end

    generate_response({ @appname => record }, 200)
  end

  # 1件のレコードを削除する
  # [引数]params:クエリパラメータ
  # [返り値]HTTPレスポンス
  def delete(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    # レコードを取得
    record = get_main_record(params)

    # HTTPレスポンスに格納するためのレコードのidを保持しておく
    record_id = record.id

    # レコードが存在しない場合
    if record.nil?
      return generate_404_response()
    end

    # レコードを削除
    record.destroy
    record.save

    generate_response({ "#{@appname}_id" => record_id }, 200)
  end
end
