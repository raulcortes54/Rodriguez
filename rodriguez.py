from flask import Flask, render_template, request, redirect, url_for

rodriguez= Flask(__name__)

@rodriguez.route('/')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    rodriguez.run(port=7777, debug=True)