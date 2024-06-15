console.log("welcome to RSTuens music web app");

let currntSong = new Audio();
let songs;
let currFolder;


function secToMinSec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toFixed()}`;
};

let getSongs = async (folder) => {
    currFolder = folder;
    let a = await fetch(`/songs/${folder}/`);
    let response = await a.text();
    //! console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1]);
        }
    }



    //show all the song in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                                  <img src="./Icons_and_Svg/music.svg" alt="music icon">
                                  <div class="info">
                                      <div>${song.replaceAll("%20", " ")}</div>
                                  </div>
                                  <div class="playnow">
                                      <img src="./Icons_and_Svg/listplay.svg" alt="play now">
                                      <span>Play Now</span>
                                  </div></li><hr>`;

    }


    //Attach an event Listener to each song

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        // console.log(e.getElementsByTagName("div")[0]);
        e.addEventListener("click", (element) => {
            //! console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            pause.src = "./Icons_and_Svg/play.svg";

        });
    });

    return songs;


};

const playMusic = (track, pause = false) => {
    //   let audio = new Audio("./songs/music/" + track);
    //   console.log(audio);
    currntSong.src = `./songs/${currFolder}/` + track;
    if (!pause) {
        currntSong.play();
        pause.src = "./Icons_and_Svg/play.svg";
    }
    document.querySelector(".songinfo").innerHTML = `🎶🎼${decodeURI(track)}🎼🎶`;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";

};

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    // console.log(div);

    let anchors = div.getElementsByTagName("a");
    // console.log(anchors);
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // console.log(e.href); 
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            //! console.log(response);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                           <img src="Icons_and_Svg/playhover.svg" alt="playHover">
                        </div>
                        <img src="./songs/${folder}/cover.jpeg" alt="playlist">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`;

        }

    }

    //Load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        // console.log(e);
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
            pause.src = "./Icons_and_Svg/play.svg";
        });
    });

}

let main = async () => {

    //get the list of all the song
    await getSongs("music");
    //! console.log(songs);
    playMusic(songs[0], true);

    //Display all the albums on the page

    displayAlbums();




    //Attach  an event listener to pause and play

    let pause = document.getElementById("pause");

    pause.addEventListener("click", () => {
        if (currntSong.paused) {
            currntSong.play();
            pause.src = "/Icons_and_Svg/play.svg";
        }
        else {
            currntSong.pause();
            pause.src = "/Icons_and_Svg/pause.svg";
        }

    });

    //listen for timeupdate event

    currntSong.addEventListener("timeupdate", () => {
        // console.log( secToMinSec(currntSong.currentTime) , secToMinSec(currntSong.duration) );
        document.querySelector(".songtime").innerHTML = `${secToMinSec(currntSong.currentTime)} /  ${secToMinSec(currntSong.duration)}`;
        document.querySelector(".circle").style.left = (currntSong.currentTime / currntSong.duration) * 100 + "%";
    });

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        //   console.log(e.target.getBoundingClientRect().width , e.offsetX);
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = persent + "%";
        currntSong.currentTime = (currntSong.duration * persent) / 100;

    });

    //add an event listener for hamburger button

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });
    //add an event listener for close/cross button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-255px"
    }
    )

    //Attach  an event listener to  previous button

    previous.addEventListener("click", () => {
        console.log("previous button clicked");
        // console.log(currntSong);
        let index = songs.indexOf(currntSong.src.split("/").slice(-1)[0]);
        // console.log(songs , index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
            pause.src = "/Icons_and_Svg/play.svg";
        }


    });

    //Attach  an event listener to  next button

    next.addEventListener("click", () => {
        console.log("next button clicked");
        let index = songs.indexOf(currntSong.src.split("/").slice(-1)[0]);
        // console.log(songs , index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
            pause.src = "/Icons_and_Svg/play.svg";
        }

    });

    //Add an Event to Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e , e.target , e.target.value );
        console.log("volume : ", e.target.value);
        currntSong.volume = parseInt(e.target.value) / 100;

    });

    //Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click" , (e) => {
        // console.log(e.target);
        // console.log("changing ",e.target.src);
    
        if(e.target.src.includes("vol.svg")){
            e.target.src = e.target.src.replace("vol.svg" ,"mute.svg");
            currntSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
            // console.log(currntSong.volume);
            
        }
        else{
            e.target.src =  e.target.src.replace("mute.svg" , "vol.svg");
            currntSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 70;
        }
         
    });







};

main();
