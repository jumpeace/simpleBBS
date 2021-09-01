require 'singleton'

# ステータスコードが404だった場合の処理に利用する値を格納するクラス
class Http404
  include Singleton
  attr_accessor :document_type

  def initialize()
    # HTTPレスポンスの文書の種類
    @document_type = nil
  end
end
