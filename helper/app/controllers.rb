require 'singleton'

require './app/models'
require './app/post/models'
require './helper/app/http404'

# AppのControllerのベース
class AppController
  include Singleton

  attr_accessor :appname, :foreign_appnames, :foreign_columns,
  :model, :columns, :is_all, :select_field

  def initialize(appname, columns, foreign_appnames)
    # Appの名前
    @appname = appname
    # モデルの名前
    @model = model_by_appname(appname)
    # モデルの普通のカラムのうち、作成時に使うカラム
    @columns = columns
    # 外部キーによってリレーションがあるAppの名前
    @foreign_appnames = foreign_appnames
    # モデルの外部キーのカラム
    @foreign_columns = @foreign_appnames.map{ |el| "#{el}_id" }
    # モデルの外部キーのカラム
    @is_all = @foreign_appnames.count.zero?
    @select_field = @is_all ? nil : "#{@foreign_appnames[0]}_id"
  end

  def h(text)
    Rack::Utils.escape_html(text)
  end

  def request_to_request_body(request)
    JSON.parse(request.body.read).with_indifferent_access
  end

  def generate_response(body_hash, status)
    {
      'body' => body_hash.to_json,
      'status' => status
    }
  end

  def generate_404_response()
    Http404.instance.setDocumentType('json')
    generate_response({}, 404)
  end

  def get_record(appname, params)
    model = model_by_appname(appname)
    model.find_by(id: h(params["#{appname}_id"]))
  end

  def get_main_record(params)
    get_record(@appname, params)
  end

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

  # foreign_appnames の1要素目は検索するときに使用するappにする
  def list(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    record = @is_all ? @model.all : @model.where("#{@select_field} = ?", h(params[@select_field]))
    record.nil? && record = []

    generate_response({ @appname.pluralize => record }, 200)
  end

  def create(request, params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    request_body = request_to_request_body(request)
    record = @model.new
    @columns.each do |field|
      record[field] = h(request_body[field])
    end

    @foreign_columns.each do |field|
      record[field] = h(params[field])
    end
    record.save

    generate_response({ @appname => record }, 200)
  end

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
