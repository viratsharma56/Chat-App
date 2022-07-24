const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sidebar = document.querySelector('#sidebar')

const $locationButton = document.querySelector('#location')

const $messages = document.querySelector('#messages')

const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationMessagesTemplate = document.querySelector('#location-message-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messagesTemplate, { message: message.text, createdAt: moment(message.createdAt).format('hh:mm:ss a'), username: message.username })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (location) => {
    console.log(location);
    const html = Mustache.render(locationMessagesTemplate, { location: location.url, createdAt: moment(location.createdAt).format('hh:mm:ss a'), username: message.username })
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => {
    console.log(room, users);
    const html = Mustache.render(sideBarTemplate, { room, users })
    console.log(html);
    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.message.value;
    socket.emit('textMessage', message, (error) => { // the last function is used to acknowledge the process successful

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = "";
        $messageFormInput.focus()

        if (error) {
            return console.log(error);
        }
        console.log('Message delivered');
    });
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Your browser not supports the geolocation')
    }

    $locationButton.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        socket.emit('sendLocation', locationData, () => {
            $locationButton.removeAttribute('disabled');
            console.log('Location has been sent');
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
})