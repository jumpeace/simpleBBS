require 'active_record'

# modelを利用するためのコード
# Databaseの読み込み
ActiveRecord::Base.configurations = YAML.load_file('./config/database.yml')
# Databaseに接続する
ActiveRecord::Base.establish_connection :development
