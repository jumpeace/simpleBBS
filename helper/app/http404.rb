require 'singleton'

class Http404
  include Singleton
  attr_accessor :document_type,
  def initialize()
    @document_type = nil
  end

  def setDocumentType(arg)
    @document_type = arg
  end
  def getDocumentType()
    return @document_type
  end
  # def type()
  #   {
  #     'set' => ->(arg) { @document_type = arg }
  #     'get' => ->(arg) { return @document_type }
  #   }
  # end
end