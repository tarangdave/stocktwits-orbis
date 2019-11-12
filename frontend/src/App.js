import React from 'react';
import axios from 'axios';
import './App.css';

class SearchBar extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        searchInput: ``,
      }
    }
    
    onEnterPress = (e) =>{
        const { onSubmit } = this.props;
        let { searchInput } = this.state;
        e.preventDefault();
        onSubmit(searchInput);
        this.setState({ searchInput: `` });
    };

    render(){
        const { searchInput } = this.state;
        return (
            <div>
                <form onSubmit={this.onEnterPress}>
                    <div>
                        <label>Search for Symbols/Messages</label>
                        <input
                            type="text"
                            value={ searchInput }
                            onChange={(e) => this.setState({searchInput : e.target.value})}
                        />
                    </div>
                </form>
            </div>
        );
    }
};


class TweetBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      userImage,
      userID,
      userName,
      body,
    } = this.props;
    return (
      <div className="box-main-div">
        <div className="sub-box-tweet-content-div col-lg-12 col-sm-12 col-xs-12 col-md-12">
          <div className="tweetbox-user-image col-md-3 col-sm-3 col-lg-3 col-xs-12">
            <div className="user-image-div">
              <img src={userImage}/>
            </div>
          </div>
          <div className="tweet-content-right col-lg-9 col-xs-12 col-sm-9 col-md-9">
            <div className="tweet-user-info">
              <div className="tweet-user-name">{userID} <span>@{userName}</span></div>
            </div>
            <div className="tweet-body-main">
              <div>{body}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      symbols: [],
      messages: [],
      currentRequestStatus: {}
    }
  }

  sendRequest = async(symbol) => {
    return await axios.get(`http://localhost:3000/tweets/${symbol}`,)
        .then((response) => {
          return response;
      })
        .catch((error) => {
        // handle error
        console.log(error);
        return error;
      });
  }

  updateSymbolList = (symbol) => {
    this.state.symbols.push(symbol);
  };

  deleteSymbol = async(i) => {
    let symbols = this.state.symbols.filter((item, j) => i !== item);
    this.setState(state => {
        return state.symbols = symbols;
      });
    await this.searchAgain(symbols);
  };

  searchAgain = async(symbols) => {
    try {
      let response = await this.sendRequest(symbols);
      
      this.newTweets(response);
    } catch (err) {
        this.setState({ messages: [] });
    };
  }

  newTweets = (apiResponse)=>{
    this.setState({ messages: apiResponse.data.messages });
  }

  onSearchSubmit =  async(sq) => {
    this.updateSymbolList(sq);

    await this.searchAgain(this.state.symbols);
}
  render() {
    const renderBox = this.state.messages.map((data, i) => {
      return (
        <TweetBox key={i} userImage={data.user.avatar_url} userID={data.user.name} userName={data.user.username} body={data.body}/>
      )
    });
    const symbolList = this.state.symbols.map((data, i) => {
      return (
        <li key={i}>{data}<button type="button" onClick={() => this.deleteSymbol(data)}>X</button></li>
      )
    });
    return (
      <div className="App">
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="#">Orbis Stocktwits App</a>
            </div>
          </div>
        </nav>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Input Symbol</label>
          <SearchBar onSubmit={this.onSearchSubmit} />
          <div>
            <ul>
                {symbolList}
            </ul>
          </div>
        </div>
        <div className="tweetbox-container-main-div">
          {renderBox}
        </div>
        
      </div>
    );
  }
}

export default App;
