require 'sinatra'
require 'json'

require './helper/app/http404'

require './app/controllers'

set :environment, :production

before do
  Http404.instance.document_type = 'erb'
end

get '/' do
  # ルートのページのリンクに飛ぶ
  redirect '/post/'
end

# 画面表示

# 投稿一覧
get '/post/' do
  erb :post
end

# 特定の投稿の返信一覧
get '/post/:post_id/reply/' do
  # 特定の投稿を取得する
  status, headers, body =
    call env.merge('PATH_INFO' => "/api/post/#{params[:post_id]}/")

  # 投稿が存在しなかったら、ページが存在しないということを示す
  if status == 404
    status 404
    Http404.instance.document_type = 'erb'
    return
  end

  # HTTPレスポンスのBODYの連想配列から特定の投稿の情報を取得する
  response_body_hash = JSON.parse(body[0])
  @post = response_body_hash['post']

  erb :reply
end

# API

# 投稿機能アプリ
# 投稿一覧を取得するエンドポイント
get '/api/post/' do
  response = controller_by_appname('post').list(params)
  status response['status']
  body response['body']
end

# 投稿を作成するエンドポイント
post '/api/post/' do
  response = controller_by_appname('post').create(request, params)
  status response['status']
  body response['body']
end

# 特定の投稿を取得するエンドポイント
get '/api/post/:post_id/' do
  response = controller_by_appname('post').detail(params)
  status response['status']
  body response['body']
end

# 特定の投稿を削除するエンドポイント
post '/api/post/:post_id/delete/' do
  response = controller_by_appname('post').delete(params)
  status response['status']
  body response['body']
end

# 特定の投稿のいいね数を増やすエンドポイント
post '/api/post/:post_id/heart/increment/' do
  response = controller_by_appname('post').increment_heart(params)
  status response['status']
  body response['body']
end

# 返信機能アプリ
# 返信一覧を取得するエンドポイント
get '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').list(params)
  status response['status']
  body response['body']
end

# 返信を作成するエンドポイント
post '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').create(request, params)
  status response['status']
  body response['body']
end

# 特定の返信を削除するエンドポイント
post '/api/post/:post_id/reply/:reply_id/delete/' do
  response = controller_by_appname('reply').delete(params)
  status response['status']
  body response['body']
end

# APIや画面表示でページが存在しなかった場合の処理
not_found do
  document_type = Http404.instance.document_type
  if document_type == 'erb'
    @status = 404
    @message = 'このページは存在しません'
    erb :http4
  end
end
