require './helper/app/controllers'

# 返信機能アプリのController
class ReplyController < AppController
  def initialize()
    super('reply', %w[message], ['post'])
  end
end
