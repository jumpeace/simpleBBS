require './app/post/models'
require './app/reply/models'

# アプリ名からModelを取得する
def model_by_appname(appname)
  model_classes = {
    'post'=> Post,
    'reply'=> Reply
  }
  model_classes[appname]
end
