from flask import Flask, render_template, request, redirect, url_for
from flask_mysqldb import MySQL
from config import config 
from werkzeug.security import generate_password_hash


rodriguezAPP = Flask(__name__)
rodriguezAPP.config.from_objet(config['development'])
db = MySQL(rodriguezAPP)

@rodriguezAPP.route('/')
def home ():
    return render_template('home.html')

@rodriguezAPP.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        nombre  = request.form['nombre']
        correo = request.form['correo']
        clave = request.form['clave']
        claveCifrada = generate_password_hash(clave)
        regUsuario = db.connection.cursor()
        regUsuario.execute('INSERT INTO usuarios (nombre, correo, clave) VALUES (%s, %s, %s)', (nombre, correo, claveCifrada))
        db.connection.commit()

        return redirect(url_for('home.html'))
    else:
        return render_template('home.html')


if __name__ == '__main__':
    rodriguezAPP.run(port=1500,debug=True)



