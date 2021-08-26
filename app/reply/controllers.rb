require './helper/app/controllers'

class ReplyController < AppController
  def initialize()
    super('reply', %w[message], ['post'])
  end
end
