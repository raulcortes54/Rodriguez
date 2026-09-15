
class Config: 
    SECRET_KEY ='elgruesputoylegustaeljuanpanocha'
    DEBUG = True

class DevelopmentConfig(Config):
        MYSQL_HOST = 'localhost'
        MYSQL_USER = 'root'
        MYSQL_PASSWORD = 'mysql'
        MYSQL_DATABASE = 'pepitos storage'

config ={

    'development' : DevelopmentConfig

        }
    