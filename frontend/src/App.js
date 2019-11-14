import React from 'react';
import axios from 'axios';
import CloseImg from './close-tag.png'
import './App.css';

const API_HOST = 'https://tyd64p9lh6.execute-api.us-east-1.amazonaws.com';
const GET_TWEETS_ENDPOINT = '/dev/tweets/';

/**
 * component to render searchbar
 */
class SearchBar extends React.Component {
    constructor(props){
      super(props);

      this.state = {
        searchInput: ``,
      }
    }
    
    /**
     * saves input entered on search bar
     */
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
                        <label><h1>Search StockTwits Tweets</h1></label>
                        <input
                            type="text"
                            className="form-control"
                            value={ searchInput }
                            placeholder="Press Enter after entering symbol Eg. AAPL, BABA, IBM, GOOGL..."
                            onChange={(e) => this.setState({searchInput : e.target.value})}
                        />
                    </div>
                </form>
            </div>
        );
    }
};


/**
 * component for displaying tweets
 */
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
          <div className="tweetbox-user-image col-md-3 col-sm-3 col-lg-3 col-xs-3">
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

/**
 * App contains all components that renders on webpage
 */
class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      symbols: [],
      messages: [],
      currentRequestStatus: {},
      currentInterval: null,
    }
  }

  /**
   * sends request to node backend hosted on AWS
   * @param {array} symbol
   * @returns {*} response
   */
  sendRequest = async(symbol) => {
    if (symbol.length !== 0) {
      return await axios.get(`${API_HOST}${GET_TWEETS_ENDPOINT}${symbol}`,)
          .then((response) => {
            return response;
        })
          .catch((error) => {
          // handle error
          console.log(error);
          return error;
        });
    }
  }

  /**
   * updates the list of symbols entered
   * @param {string} symbol
   */
  updateSymbolList = (symbol) => {
    this.state.symbols.push(symbol);
  };

  /**
   * filters the deleted symbol and updates the state and fetches updated tweets
   * @param {string} i
   */
  deleteSymbol = async(i) => {
    clearInterval(this.state.currentInterval);
    let symbols = this.state.symbols.filter((item, j) => i !== item);
    this.setState(state => {
        return state.symbols = symbols;
      });
    await this.searchAgain(symbols);

    let interval = setInterval(async() => { await this.searchAgain(symbols); }, 25000);
    this.setState({ currentInterval: interval });
  };

  /**
   * api call wrapper, updates the new tweets state
   * @param {array} symbols
   */
  searchAgain = async(symbols) => {
    try {
      let response = await this.sendRequest(symbols);
      
      this.newTweets(response);
    } catch (err) {
        this.setState({ messages: [] });
    };
  }

  /**
   * updates messages state with new api reponse
   * @param res
   */
  newTweets = (res)=>{
    this.setState({ messages: res.data.messages });
  }

  /**
   * function called when new symbol is entered
   * @param {string} sq
   */
  onSearchSubmit =  async(sq) => {
    if (sq) {
      sq = sq.toUpperCase();
      clearInterval(this.state.currentInterval);
      this.updateSymbolList(sq);

      await this.searchAgain(this.state.symbols);

      let interval = setInterval(async() => { await this.searchAgain(this.state.symbols); }, 30000);

      this.setState({ currentInterval: interval });
    }
}
  render() {
    const renderBox = this.state.messages.map((data, i) => {
      return (
        <TweetBox key={i} userImage={data.user.avatar_url} userID={data.user.name} userName={data.user.username} body={data.body}/>
      )
    });
    const symbolList = this.state.symbols.map((data, i) => {
      return (
        <div className="new-tag" key={i}>{data}
          <img className="remove-filter delete" src={CloseImg} onClick={() => this.deleteSymbol(data)}></img>
        </div>
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
        <div className="container">
          <div className="form-group">
            <SearchBar onSubmit={this.onSearchSubmit} />
            <div className="current-showing">
              {symbolList}
            </div>
          </div>
        </div>
        { this.state.messages.length !== 0 ? 
        <div className="tweetbox-container-main-div">
          {renderBox}
        </div> : <div className="container center-align"><h2>No Relevant Tweets found...</h2></div>}
      </div>
    );
  }
}

export default App;
