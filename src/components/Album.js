import React, { Component } from 'react';
import albumData from './../data/albums';
import PlayerBar from './PlayerBar';

class Album extends Component {
  constructor(props) {
    super(props);
     
    const album = albumData.find( album => {
      return album.slug === this.props.match.params.slug
    });

    this.state = {
      album: album,
      currentSong: album.songs[0],
      currentTime: 0,
      duration: album.songs[0].duration,
      currentVolume: 0.5,
      volumePercent: 50,  
      isPlaying: false
    };
     
    this.audioElement = document.createElement('audio');
    this.audioElement.src = album.songs[0].audioSrc;
  }

  componentDidMount() {
    this.eventListeners = {
      timeupdate: e => {
        this.setState({ currentTime: this.audioElement.currentTime });
      },
      durationchange: e => {
        this.setState({ duration: this.audioElement.duration });
      },
      volumechange: e => {
        this.setState({ currentVolume: this.audioElement.volume});
      }
    };
    this.audioElement.addEventListener('timeupdate', this.eventListeners.timeupdate);
    this.audioElement.addEventListener('durationchange', this.eventListeners.durationchange);
    this.audioElement.addEventListener('volumechange', this.eventListeners.volumechange);
  }

  componentWillUnmount() {
    this.audioElement.src = null;
    // this.audioElement = null;
    this.audioElement.removeEventListener('timeupdate', this.eventListeners.timeupdate);
    this.audioElement.removeEventListener('durationchange', this.eventListeners.durationchange);
    this.audioElement.removeEventListener('volumechange', this.eventListeners.volumechange);
  }

    play() {
      this.audioElement.play();
      this.setState({ isPlaying: true });
    }

    pause() {
      this.audioElement.pause();
      this.setState({ isPlaying: false });
    }   
 
    setSong(song) {
      this.audioElement.src = song.audioSrc;
      this.setState({ currentSong: song });
    }
 
    handleSongClick(song) {
      const isSameSong = this.state.currentSong === song;
      if (this.state.isPlaying && isSameSong) {
        this.pause();
      } else {
        if (!isSameSong) { this.setSong(song); }  
        this.play();
      }
    }

    handlePrevClick() {
      const currentIndex = this.state.album.songs.findIndex(song => this.state.currentSong === song);
      const newIndex = Math.max(0, currentIndex - 1);
      const newSong = this.state.album.songs[newIndex];
      this.setSong(newSong);
      this.play(newSong);
    }

    handleNextClick() {
      const currentIndex = this.state.album.songs.findIndex(song => this.state.currentSong === song);
      const lastIndex= this.state.album.songs.length - 1;
      const newIndex = Math.min(lastIndex, currentIndex + 1);
      const newSong = this.state.album.songs[newIndex];
      this.setSong(newSong);
      this.play(newSong);
    }

    handleTimeChange(e) {
      const newTime = this.audioElement.duration * e.target.value;
      this.audioElement.currentTime = newTime;
      this.setState({ currentTime: newTime });
    } 

    handleVolumeChange(e) {
      const newVolume = (e.target.value);
      const newVolumePercent = Math.round((e.target.value)*100);
      this.audioElement.volume = newVolume;
      this.setState({ currentVolume: newVolume });
      this.setState({ volumePercent: newVolumePercent});
    } 

    formatTime(time) {
      if (time){
        const newTime = Math.floor(time/60) + ":" + ((time%60 < 10) ? ("0" + (Math.floor(time%60))) : (Math.floor(time%60)));
        return newTime;
      } else {
        return "-:--";
      }
    }
 
  render() {
    return (
      <div className="music_player">
  <div className="artist_img">
    <img id="album-cover-art" src={this.state.album.albumCover} />
  </div>
  <div className="time_slider">
    <div className="current-time">{this.props.formatCurrentTime}</div>
        <input 
            type="range" 
            className="seek-bar" 
            value={(this.props.currentTime / this.props.duration) || 0} 
            max="1" 
            min="0" 
            step="0.01" 
            onChange={this.props.handleTimeChange}
        />   
    <div className="total-time">{this.props.formatRemainingTime}</div>
  </div>
  <div className="now_playing">
    <i className="fa fa-refresh" aria-hidden="true"></i>
    <p>now playing</p>
    <i className="fa fa-heart" aria-hidden="true"></i>
  </div>
  <div className="music_info">
    <h2 className="artist">{this.state.album.artist}</h2>
    <p className="date">{this.state.album.releaseInfo}</p>
    <p className="song_title">{this.state.album.title}</p>
    <section id="volume-control">
        <div className="icon ion-volume-low"></div>
         <input 
           type="range" 
           className="volume-bar" 
           value= {this.props.currentVolume}
           max="1" 
           min="0" 
           step="0.01"
           onChange={this.props.handleVolumeChange} 
         />   
         <div className="icon ion-volume-high"></div> 
         <div>Volume: {this.props.volumePercent} % </div>
    </section>
  </div>
  <div className="controllers">
    <button className="fa fa-fast-backward" onClick={this.props.handlePrevClick}>
        <span className="ion-skip-backward"></span>
    </button>
    <button className="fa fa-play" onClick={this.props.handleSongClick} >
        <span className="ion-play"></span>
        <span className="ion-pause"></span>
    </button>
    <button className="fa fa-fast-forward" onClick={this.props.handleNextClick}>
        <span className="ion-skip-forward"></span>
    </button>
  </div>
</div>
 
<div className="song_list">
    {
        this.state.album.songs.map( (song, index) => 
            <div className="title" key={index} onClick={() => this.handleSongClick(song)} >
                <div>{index+1}</div>
                <div>{song.title}</div>
                <div>{this.formatTime(song.duration)}</div>
            </div>
        )
    } 
</div>

  // original template code for song list:
  // <!-- <div class="title">song name</div>
  // <div class="title">artist name</div>
  // <div class="title dark">song name</div>
  // <div class="title dark">artist name</div>
  // <div class="title">song name</div>
  // <div class="title">artist name</div>
  // <div class="title dark">song name</div>
  // <div class="title dark">artist name</div>
  // </div> -->  

         <PlayerBar
           isPlaying={this.state.isPlaying}
           currentSong={this.state.currentSong}
           currentTime={this.audioElement.currentTime}
           duration={this.audioElement.duration}
           currentVolume={this.audioElement.currentVolume}
           volumePercent={this.state.volumePercent}
           handleSongClick={() => this.handleSongClick(this.state.currentSong)}
           handlePrevClick={() => this.handlePrevClick()}
           handleNextClick={() => this.handleNextClick()}
           handleTimeChange={(e) => this.handleTimeChange(e)}
           handleVolumeChange={(e) => this.handleVolumeChange(e)}
           formatCurrentTime={this.formatTime(this.state.currentTime)}
           formatRemainingTime={this.formatTime(this.state.duration - this.state.currentTime)}
         />

    );
  }
}

export default Album;