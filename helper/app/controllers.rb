require 'singleton'

require './app/models'
require './app/post/models'
require './helper/app/http404'

# 各アプリのControllerのベース
class AppController
  include Singleton

  attr_accessor :appname, :foreign_appnames, :foreign_columns, :model, :columns, :is_all, :select_column

  def initialize(appname, columns, foreign_appnames)
    # アプリ名
    @appname = appname
    # モデルの名前
    @model = model_by_appname(appname)
    # モデルの普通のカラムのうち、作成時に使うカラム
    @columns = columns
    # 外部キーによってリレーションがあるアプリ名
    @foreign_appnames = foreign_appnames
    # モデルの外部キーのカラム
    @foreign_columns = @foreign_appnames.map{ |el| "#{el}_id" }
    # 一覧を取得するときに、全件を取得するか
    @is_all = @foreign_appnames.count.zero?
    # 一覧を取得するときに、何のカラムを基準に検索するか
    @select_column = @is_all ? nil : "#{@foreign_appnames[0]}_id"
  end

  # サニタイジング処理を行う
  def h(text)
    Rack::Utils.escape_html(text)
  end

  # リクエストから連想配列のリクエストボディに変換する
  def request_to_request_body(request)
    JSON.parse(request.body.read).with_indifferent_access
  end

  # 連想配列のリクエストボディとステータスコードからレスポンスを生成する
  def generate_response(body_hash, status)
    {
      'body' => body_hash.to_json,
      'status' => status
    }
  end

  # ステータスコードが404のレスポンスを生成する
  def generate_404_response()
    Http404.instance.document_type - 'json'
    generate_response({}, 404)
  end

  # 任意のアプリのModelのレコードを取得する
  def get_record(appname, params)
    model = model_by_appname(appname)
    model.find_by(id: h(params["#{appname}_id"]))
  end

  # 該当するアプリのModelのレコードを取得する
  def get_main_record(params)
    get_record(@appname, params)
  end

  # 外部キーを利用して、ステータスコードが404かどうが判定する
  def is_404_by_foreign(params)
    result = false

    @foreign_appnames.each do |appname|
      if get_record(appname, params).nil?
        result = true
        break
      end
    end

    result
  end

  # 検索条件に従って、レコードの一覧を取得する
  def list(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    record = @is_all ? @model.all : @model.where("#{@select_column} = ?", h(params[@select_column]))
    record.nil? && record = []

    generate_response({ @appname.pluralize => record }, 200)
  end

  # 新しいレコードを作成する
  def create(request, params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

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

    record.save

    generate_response({ @appname => record }, 200)
  end

  # 1件のレコードを取得する
  def detail(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    record = get_main_record(params)

    if record.nil?
      return generate_404_response()
    end
    generate_response({ @appname => record }, 200)
  end

  # 1件のレコードを削除する
  def delete(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    record = get_main_record(params)

    record_id = record.id
    if record.nil?
      return generate_404_response()
    end
    record.destroy
    record.save
    generate_response({ "#{@appname}_id" => record_id }, 200)
  end
end
