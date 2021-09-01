require './helper/app/controllers'

# 投稿機能アプリのController
class PostController < AppController
  def initialize()
    super('post', %w[message], [])
  end

  # いいね数を増やす
  # [引数]params:クエリパラメータ
  # [返り値]HTTPレスポンス
  def increment_heart(params)
    if is_404_by_foreign(params)
      return generate_404_response()
    end

    # レコードの取得
    record = get_main_record(params)

    # レコードが存在しない場合
    if record.nil?
      return generate_404_response()
    end

    # いいね数を増やす
    record.heart += 1
    record.save

    generate_response(
      { 'id' => record.id, 'heart' => record.heart }, 200
    )
  end
end
