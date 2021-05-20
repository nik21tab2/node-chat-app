const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationSelection =   document.querySelector('#send-location')
const $messages =document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //height of last new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) 
    {
        // if for any new message, the scroll bar needs to be scrolled down
        // then only use this line before
        $messages.scrollTop = $messages.scrollHeight
    }



}

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage', (message) =>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url : message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room, users})=>{
    const html= Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault()

    //disable
    $messageFormButton.setAttribute('disabled','disabled')

    const msgStr = e.target.elements.message.value
    
    socket.emit('sendMessage',msgStr, (error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error)
        {
            return console.log(error)
        }
        console.log('the message was delivered')
    })
})

$sendLocationSelection.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('geo location not suported')
    }

    $sendLocationSelection.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        
        }, ()=>{
            $sendLocationSelection.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }

})