var React = require('react');
var React = require('react');

class Layout extends React.Component {
  render() {
    return (
        <html>
            <head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous"/>

                <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>

                <link rel="stylesheet" href="/style.css"></link>
            </head>

            <body>
                <nav className="navbar navbar-expand-lg navbar-light bg-light ">
                    <a className="navbar-brand " href="/user/events">Logo: Let's Meet Up!!</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>


                    <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">


                        <ul className="navbar-nav ">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Manage your events
                             </a>
                            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item" href="#">Action</a>
                                <a class="dropdown-item" href="#">Another action</a>

                            </div>
                        </li>





                            <li className="nav-item">
                                <a className="nav-link" href="/user/events">Browse Events<span className="sr-only"></span></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/user" id="navName">{this.props.name}<span className="sr-only"></span></a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/logout">Logout<span className="sr-only"></span></a>
                            </li>
                        </ul>
                    </div>
                </nav>
                {this.props.children}
            </body>
        </html>
    );
  }
}


module.exports = Layout;