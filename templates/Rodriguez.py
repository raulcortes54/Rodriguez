from flask import Flask

Rodriguez= Flask(__name__)

@Rodriguez.route('/')
def home():
    return "<h1>Bienvenido a Rodriguez Store</h1>"

if __name__ == '__main__':
    Rodriguez.run(port=7777, debug=True)