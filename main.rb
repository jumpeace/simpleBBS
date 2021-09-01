require 'sinatra'
require 'json'

require './helper/app/http404'

require './app/controllers'

set :environment, :production

before do
  Http404.instance.document_type = 'erb'
end

get '/' do
  redirect '/post/'
end

# 画面表示
# 投稿一覧
get '/post/' do
  erb :post
end

# 任意の投稿の返信一覧
get '/post/:post_id/reply/' do
  status, headers, body =
    call env.merge('PATH_INFO' => "/api/post/#{params[:post_id]}/")
  if status == 404
    status 404
    Http404.instance.document_type = 'erb'
    return
  end

  response_body_hash = JSON.parse(body[0])
  @post = response_body_hash['post']
  erb :reply
end

# API

# 投稿エンドポイント
# 投稿一覧を取得
get '/api/post/' do
  response = controller_by_appname('post').list(params)
  status response['status']
  body response['body']
end

# 投稿を作成
post '/api/post/' do
  response = controller_by_appname('post').create(request, params)
  status response['status']
  body response['body']
end

# 指定された投稿を取得
get '/api/post/:post_id/' do
  response = controller_by_appname('post').detail(params)
  status response['status']
  body response['body']
end

# 指定された投稿を削除
post '/api/post/:post_id/delete/' do
  response = controller_by_appname('post').delete(params)
  status response['status']
  body response['body']
end

# 指定された投稿のいいね数を増やす
post '/api/post/:post_id/heart/increment/' do
  response = controller_by_appname('post').increment_heart(params)
  status response['status']
  body response['body']
end

# 返信エンドポイント
# 返信一覧を取得
get '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').list(params)
  status response['status']
  body response['body']
end

# 返信を作成
post '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').create(request, params)
  status response['status']
  body response['body']
end

# 特定の返信を削除
post '/api/post/:post_id/reply/:reply_id/delete/' do
  response = controller_by_appname('reply').delete(params)
  status response['status']
  body response['body']
end

# APIや画面表示で、404だった場合
not_found do
  document_type = Http404.instance.document_type
  if document_type == 'erb'
    @status = 404
    @message = 'このページは存在しません'
    erb :http4
  end
end
