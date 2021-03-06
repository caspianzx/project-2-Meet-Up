var React = require('react');

const Layout = require('./layoutUser.jsx');


class Form extends React.Component {
    render() {
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
        let daysInWeek = ["sunday", "mon", "tues", "wed", "thurs", "fri", "sat"];

         {/* map all events into a list */}
        const eventList= this.props.eventHost.map(eachEvent => {
            let dateString = eachEvent._date;
            let day = dateString.getDate();
            let weekDay = dateString.getDay();
            let month = monthNames[dateString.getMonth()];
            let year = dateString.getFullYear();
            let link = "/user/events/"+ eachEvent.id;

            return(
                <a href= {link}>
                <ul className ="event-host-padding">
                    <li className="list-group-item list-group-item-success">
                        <p className = "event-name">{eachEvent.name} </p>
                        <p className = "event-details">{day} {month}, {eachEvent.to_char}, {eachEvent.venue} </p>
                    </li>
                    </ul>
                </a>
            )
        });

        const eventRegisteredDisplay= this.props.eventRegistered.map(eachEvent => {
            let dateString = eachEvent._date;
            let day = dateString.getDate();
            let weekDay = dateString.getDay();
            let month = monthNames[dateString.getMonth()];
            let year = dateString.getFullYear();
            let link = "/user/events/"+ eachEvent.id;

            return(
                <a href= {link}>
                <ul >
                    <li className="list-group-item list-group-item-success">
                        <p className = "event-name">{eachEvent.name} </p>
                        <p className = "event-details">{day} {month}, {eachEvent.to_char}, {eachEvent.venue} </p>
                    </li>
                    </ul>
                </a>
            )
        });



        return (
            <Layout name={this.props.name} >
                  {/* dashboard */}
                <div className="container">
                    <div className="row">
                        <div className="col-6 offset-3">
                            <h1 className= "create">WELCOME </h1>
                            <p className ="welcomeName"> {this.props.name}</p>
                            <br/>
                        </div>
                    </div>
                     {/* dashboard for attending events */}
                    <div className="row">
                        <div className="col-6 event-attend" >
                            <p className ="text-center" id="attending"> Attending</p>
                            <ul className="list-group">
                                    {eventRegisteredDisplay}
                            </ul>
                        </div>
                         {/* dashboard for hosting events */}
                        <div className="col-6 event-host">
                            <p id="hosting"> Hosting</p>
                            <ul className="list-group">
                                {eventList}
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}

module.exports = Form;