require 'singleton'

# ステータスコードが404だった場合の処理に利用する値を格納する
class Http404
  include Singleton
  attr_accessor :document_type

  def initialize()
    # 文書の種類
    @document_type = nil
  end
end
