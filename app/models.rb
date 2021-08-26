require './app/post/models'
require './app/reply/models'

def model_by_appname(appname)
  data = {
    'post'=> Post,
    'reply'=> Reply
  }
  data[appname]
end
