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
end
