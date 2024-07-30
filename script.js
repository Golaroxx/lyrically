console.log('script is working fine ');
let currentsong = new Audio();
let songs;
let currFolder;

function convertSecondsToTimeFormat(totalSeconds) {
    if(isNaN(totalSeconds)|| totalSeconds<0){
        return"00:00"
    }
    // totalSeconds = Math.floor(totalSeconds);
    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format minutes and seconds to ensure two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Return the formatted time string
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder){
      currFolder = folder;
      let a = await fetch(`/${folder}/`)
      let response = await a.text();
      console.log(response);
      let div = document.createElement("div")
      div.innerHTML= response;
      let as = div.getElementsByTagName("a")
      songs=[]
      for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show al lsongs in the playlist 
      let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML="";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML +  `<li><img class="invert" src="music.svg" alt="">
                        <div class="info">
                           <div> ${song.replaceAll("%20", " ")} </div>
                           <div>dollar</div>
                        </div>
                        <div class=" playnow">
                            <span>Play now</span>
                          <img class="" src="playbar-svgs/play-button.svg" width="30px" > 
                        </div></li>`;
    }

    //attaching an event listner to each song 
   Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",element=>{
         playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            })
   })
    
      return songs
      

}
      
const playMusic =(track,pause=false)=>{
    // let audio = new Audio("/songs/" + track)
    currentsong.src=`/${currFolder}/`+ track
    if(!pause){
        currentsong.play()
        play.src="/playbar-svgs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML= decodeURI(track)
    document.querySelector(".songtime").innerHTML="00:00/00:00"
     }

     async function displayAlbums() {
        console.log("displaying albums")
        let a = await fetch(`/songs/`)
        let response = await a.text();
        let div = document.createElement("div")
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a")
        let cardContainer = document.querySelector(".cardContainer")
        let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index]; 
            if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
                let folder = e.href.split("/").slice(-2)[0]
                // Get the metadata of the folder
                let a = await fetch(`/songs/${folder}/info.json`)
                let response = await a.json(); 
                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                            stroke-linejoin="round" />
                    </svg>
                </div>


                <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
} 


async function main(){

    //getting list of add ll songs 
    await getsongs("songs/slow")
    playMusic(songs[0],true)
    
    //displaying the songs 
    console.log(songs)

     // Display all the albums on the page
     await displayAlbums()


   //attach eventlistner to play,next and previous
   play.addEventListener("click",()=>{
    if(currentsong.paused){
        currentsong.play()
        play.src="/playbar-svgs/pause.svg"
    }
    else{
        currentsong.pause()
        play.src="/playbar-svgs/play-button.svg"

    }
  })

   //listen for updating the time
   currentsong.addEventListener("timeupdate",()=>{
    document.querySelector(".songtime").innerHTML=`${convertSecondsToTimeFormat(currentsong.currentTime)}/${convertSecondsToTimeFormat(currentsong.duration)}`
    document.querySelector(".circle").style.left=(currentsong.currentTime / currentsong.duration)*100+"%";
   })
   
   //add a eventlistner to seekbar 
   document.querySelector(".seekbar").addEventListener("click", e=>{
    let percent=(e.offsetX / e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left = percent +"%";
    currentsong.currentTime = ((currentsong.duration)* percent)/100
   })
     
   //for hamburger
   document.querySelector(".hamburger").addEventListener("click",()=> {
         document.querySelector(".left").style.left = "0"
   })

   //for close button 
   document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-120%"
   })
   
   //addding a event for previous song
   previous.addEventListener("click",()=>{
    console.log("previous clicked")
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index -1)>=0){
            playMusic(songs[index-1])
        }
    })

    //addding a event for next song
    next.addEventListener("click",()=>{
        currentsong.pause()
        console.log("next clicked")

        let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
   
       })
  
   
     //add an event to volume
     document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
       console.log("setting volume to", e.target.value,"/100")
       currentsong.volume= parseInt(e.target.value)/100;
       if (currentsong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
         }
   })


    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

     //load the playlist whenever someone click the card
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        
        
        e.addEventListener("click",async item=>{
            console.log(item.target,item.currentTarget.dataset)
            
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
     })
   
     //relacing your library with current album name
     document.getElementsByClassName("")

    }

        main()
