import React, {createRef} from 'react';

class App extends React.Component {
  state = {
    circles: [],
    color:'black',
  };

  componentDidMount() {
    this.websocket = new WebSocket('ws://localhost:8000/circles');

    this.websocket.onmessage = (circle) => {
      try {
        const data = JSON.parse(circle.data);

        if (data.type === 'NEW_CIRCLE') {
          const newCircle = {
            circle: data.circle
          };
          this.setState({circles: [...this.state.circles, newCircle]});

          const canvas = this.canvas.current;

          const ctx = canvas.getContext('2d');

          this.state.circles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.circle.x, circle.circle.y, 50, 0, 2 * Math.PI);
            ctx.fillStyle = circle.circle.color;
            ctx.fill();
            ctx.stroke();
          })
        } else if (data.type === 'LAST_CIRCLES') {
          this.setState({circles: data.circle});
        }
      } catch (e) {
        console.log('Something went wrong', e);
      }
    };

  }

  sendCircle = e => {
    const circle = {
      type: 'CREATE_CIRCLE',
      circle: e
    };

    this.websocket.send(JSON.stringify(circle));
  };



  onCanvasClick = e => {
    e.persist();
    console.log(e);

    const canvas = this.canvas.current;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(e.clientX, e.clientY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.stroke();

    const circle = {
      x:e.clientX,
      y:e.clientY,
      color:this.state.color
    };
    this.sendCircle(circle)

  };

  canvas = createRef();

  setColor = col => {
    this.setState({color:col})
  };
  render() {
    const colors = ["yellow","red","blue","pink"];
    return (
      <>
        <div style={({textAlign:"center"})}>
          <h1>set a color</h1>
          {colors.map(col => (
              <div key={col} onClick={() => this.setColor(col)} style={{cursor:"pointer"}} >{col}</div>
          ))}

        </div>

        <canvas width={window.innerWidth} height={window.innerHeight} ref={this.canvas} onClick={this.onCanvasClick}/>
      </>
    );
  }
}

export default App;
