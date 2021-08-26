require 'sinatra'
require 'active_record'
require 'json'

require './helper/app/http404'
require './app/controllers'

set :environment, :production

enable :sessions

before do
  Http404.instance.setDocumentType('erb')
end

get '/' do
  redirect '/post/'
end

get '/post/' do
  erb :post
end

get '/post/:post_id/reply/' do
  status, headers, body =
    call env.merge('PATH_INFO' => "/api/post/#{params[:post_id]}/")
  if status == 404
    status 404
    Http404.instance.setDocumentType('erb')
    return
  end

  response_body_hash = JSON.parse(body[0])
  post = response_body_hash['post']
  @post = post
  erb :reply
end

get '/api/post/' do
  response = controller_by_appname('post').list(params)
  status response['status']
  body response['body']
end

post '/api/post/' do
  response = controller_by_appname('post').create(request, params)
  status response['status']
  body response['body']
end

get '/api/post/:post_id/' do
  response = controller_by_appname('post').detail(params)
  status response['status']
  body response['body']
end

# delete '/api/post/:post_id/'
post '/api/post/:post_id/delete/' do
  response = controller_by_appname('post').delete(params)
  status response['status']
  body response['body']
end

# patch '/api/post/:post_id/heart/increment/
post '/api/post/:post_id/heart/increment/' do
  response = controller_by_appname('post').increment_heart(params)
  status response['status']
  body response['body']
end

get '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').list(params)
  status response['status']
  body response['body']
end

post '/api/post/:post_id/reply/' do
  response = controller_by_appname('reply').create(request, params)
  status response['status']
  body response['body']
end

post '/api/post/:post_id/reply/:reply_id/delete/' do
  response = controller_by_appname('reply').delete(params)
  status response['status']
  body response['body']
end

not_found do
  document_type = Http404.instance.getDocumentType()
  if document_type == 'erb'
    @status = 404
    @message = "このページは存在しません"
    erb :http4
  end
end
