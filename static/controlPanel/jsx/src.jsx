var MainPanel = React.createClass({

    changePage: function(page){
        this.setState({page: page})
    },

    getInitialState: function(){

        var defaultPage = "control" //Pages "control" "config"

        return {
            page: defaultPage
        }
    },

    render: function(){

        var display;
        var configButton;

        if (this.state.page == "control") {
            configButton = <button className="configButton" type="button" onClick={this.changePage.bind(this, "config")}></button>
            display = <Outputs />
        }
        else if (this.state.page == "config") {
            configButton = <button className="configButton" type="button" onClick={this.changePage.bind(this, "control")}></button>
            display = <Config />
        }

        return (
            <div className="panel">
                {configButton}
                {display}
            </div>
        );
    }
});

var Config = React.createClass({

    checkStatus: function(){
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,

            success: function(data) {

                var zoneName = []

                for (var property in data["zoneName"]){
                    zoneName.push(data["zoneName"][property])
                }

                this.setState({zoneName: zoneName});
            }.bind(this),

            error: function(xhr, status, err) {
                console.error("getData", status, err.toString());
            }.bind(this)

        });
    },

    sendStatus: function(zoneName){

        clearInterval(this.timer);

        var data = {outputs: {
            out0: zoneName[0],
            out1: zoneName[1],
            out2: zoneName[2],
            out3: zoneName[3],
            out4: zoneName[4],
            out5: zoneName[5],
            out6: zoneName[6],
            out7: zoneName[7]
        }};

        $.ajax({
            url: "sendNameData",
            dataType: 'text',
            type: 'POST',
            data:  JSON.stringify(data),
            success: function(data) {
                for (var i = 0; i < this.state.numOuts; i++){
                    zoneName[i] = data["outputs"]["out"+i];
                }
                this.setState({zoneName: zoneName});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("sendData", status, err.toString());
            }.bind(this)
        });

        this.timer = setInterval(this.tick, 5000);
    },

    componentDidMount: function(){
        this.checkStatus();
    },

    componentWillUnmount: function(){
        this.sendStatus(this.state.zoneName);
    },

    getInitialState: function(){

        var zoneName = []

        return {
            zoneName: zoneName,
        }
    },

    handleChange: function(index, event) {
        var zoneName = this.state.zoneName;
        zoneName[index] = event.target.value;
        this.setState({zoneName: zoneName});
    },

    render: function(){

        var numOuts = 8;
        var config = [];
        var zoneName = this.state.zoneName;
        var buttonName;

        for (var i = 0; i < numOuts; i++ ){

            buttonName = i + 1;

            config.push(
                <div className="config" key ={13*i}>
                    <h1>{buttonName}</h1>
                    <input type="text" value={zoneName[i]} onChange={this.handleChange.bind(this, i)} />
                </div>
            )
        }
        return (
            <div>
                {config}
            </div>
        );
    }
});

var Outputs = React.createClass({

    checkStatus: function(){
        $.ajax({
            url: "getData",
            dataType: 'json',
            cache: false,
            success: function(data) {

                var outs = []
                for (var property in data["outputs"]){
                    outs.push(data["outputs"][property])
                }
                this.setState({outs: outs});

                var zoneName = []
                for (var property in data["zoneName"]){
                    zoneName.push(data["zoneName"][property])
                }
                this.setState({zoneName: zoneName});

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("getData", status, err.toString());
            }.bind(this)
        });
    },

    sendStatus: function(outs){

        clearInterval(this.timer);

        var data = {outputs: {
            out0: outs[0],
            out1: outs[1],
            out2: outs[2],
            out3: outs[3],
            out4: outs[4],
            out5: outs[5],
            out6: outs[6],
            out7: outs[7]
        }};

        $.ajax({
            url: "sendOutputData",
            dataType: 'json',
            type: 'POST',
            data:  JSON.stringify(data),
            success: function(data) {
                for (var i = 0; i < this.state.numOuts; i++){
                    outs[i] = data["outputs"]["out"+i];
                }
                this.setState({outs: outs});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("sendData", status, err.toString());
            }.bind(this)
        });

        this.timer = setInterval(this.tick, 5000);
    },

    componentDidMount: function(){
        this.checkStatus();
        this.timer = setInterval(this.tick, 5000);
    },

    componentWillUnmount: function(){
        clearInterval(this.timer);
    },

    tick: function(){
        this.checkStatus();
    },

    enableOut: function(index){

        var outs = this.state.outs
        outs[index] = 1

        this.sendStatus(outs);

        this.setState({outs: outs});
    },

    disableOut: function(index){

        var outs = this.state.outs;
        outs[index] = 0;

        this.sendStatus(outs);

        this.setState({outs: outs});
    },

    getInitialState: function(){
        var zoneName = []
        var outs = []
        var numOuts = 8
        for (var i = 0; i < numOuts; i++ ){
            outs.push(0)
        }
        return {
            outs: outs,
            zoneName: zoneName,
            numOuts: numOuts
        }
    },

    render: function(){
        var numOuts = 8
        var controls = []

        var ledStatus;
        var button;
        var buttonName;
        var zoneName;

        for (var i = 0; i < numOuts; i++ ){

            buttonName = i + 1;
            zoneName = this.state.zoneName[i];

            if (this.state.outs[i] == 0) {
                ledStatus = 'redCircle';
                button = <button className="enable" type="button" onClick={this.enableOut.bind(this, i)}>Activar</button>;
            }
            else if (this.state.outs[i] == 1) {
                ledStatus = 'greenCircle';
                button = <button className="disable" type="button" onClick={this.disableOut.bind(this, i)}>Desactivar</button>
            }

            controls.push(

                <div className="output" key={13*i}>
                    <h1>{zoneName}</h1>
                    <div className={ledStatus}></div>
                    {button}
                </div>
            )
        }
        return (
            <div>
                {controls}
            </div>
        );
    }
});

React.render(
    <MainPanel/>,
    document.getElementById('panel')
);
