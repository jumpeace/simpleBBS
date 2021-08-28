require './helper/app/controllers'

# 返信アプリのController
class ReplyController < AppController
  def initialize()
    super('reply', %w[message], ['post'])
  end
end
