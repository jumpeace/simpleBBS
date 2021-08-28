require './app/post/controllers'
require './app/reply/controllers'

# アプリ名からControllerを取得する
def controller_by_appname(appname)
  controller_classes = {
    'post'=> PostController,
    'reply'=> ReplyController
  }
  controller_classes[appname].instance
end
