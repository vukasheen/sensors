var devices = {
	3806520034: 'Dnevna soba'
};

Highcharts.setOptions({
    global: {
        useUTC: false
    }
});

var highchartsOptions = {
    title: {
        text: 'Temperatura',
        x: -20 //center
    },
    subtitle: {
        text: 'U poslednjih 100 sati',
        x: -20
    },
    xAxis: {
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: 'Temperatura (°C)'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    },
    tooltip: {
        valueSuffix: '°C'
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    },
	credits: false,
    series: []
};

//var element = React.createElement('div', { id: 'chart' });

var ChartEl = React.createClass({
    componentDidMount: function() {
        this.serverRequest = $.get(this.props.source, function(result) {
            var temperatures = {}
            $.each(result, function(index, item) {
                if (!temperatures[item.device_id]) temperatures[item.device_id] = [];
                temperatures[item.device_id].push([item.date, item.temperature]);
            });

	    $.each(temperatures, function(key, item) {
		item.sort(function(a, b) {
			return a[0] - b[0];
		});
	    });

            var series = [];
            $.each(temperatures, function(key, item) {
                series.push({
                    name: devices[key],
                    data: item,
                    marker: {
                        fillColor: 'white',
                        lineWidth: 2,
                        lineColor: Highcharts.getOptions().colors[0]
                    }

                });
            });


            highchartsOptions.series = series;
            Highcharts.chart('chart', highchartsOptions);
        }.bind(this));
    },

    componentWillUnmount: function() {
        this.serverRequest.abort();
    },

    render: function() {
        return (
            React.createElement('div', {
                id: 'chart'
            })
        );
    }
});

var element = React.createElement(ChartEl, {
    source: "/data"
});

ReactDOM.render(element, document.getElementById('react-app'), function() {});