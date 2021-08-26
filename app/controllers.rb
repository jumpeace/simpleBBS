require './app/post/controllers'
require './app/reply/controllers'

def controller_by_appname(appname)
  data = {
    'post'=> PostController.instance,
    'reply'=> ReplyController.instance
  }
  data[appname]
end