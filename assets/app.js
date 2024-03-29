var btn, eyeson, txt, room, shutdown, ticket, user, zendesk,
    SMALL = '55px', LARGE = '85px';

eyeson = {
  createRoom: function(room, user) {
    return this.request({
      url: '/rooms',
      type: 'POST',
      data: {
        id: room.id,
        user: {
          id: user.email,
          name: user.name,
          avatar: user.avatarUrl,
        }
      },
    });
  },

  getRoom: function(room) {
    return this.request('/rooms/' + room.id);
  },

  request: function(options) {
    if (typeof options === 'string') options = {url: options};
    if (options.url.startsWith('/')) options.url = 'https://api.eyeson.team' + options.url;
    options.headers = {'Authorization': '{{ setting.api_key }}'};
    options.secure = true;
    return zendesk.request(options);
  },
}

zendesk = ZAFClient.init();

function init() {
  btn = document.querySelector('button[data-btn]');
  btn.onclick = startMeeting;
  txt = document.querySelector('.text-options');

  eyeson.getRoom(room).then(
    function(response) {
      shutdown = response.shutdown;
      renderSidebar();
    },
    function(response) {
      shutdown = true;
      renderSidebar();
    },
  );
}

function openWindow() {
  var width = screen.availWidth * .9,
      height = screen.availHeight * .9,
      top = screen.availTop,
      left = screen.availLeft + screen.availWidth * .05;

  return window.open('about:blank', '_blank', [
    'width=' + width,
    'height=' + height,
    'top=' + top,
    'left=' + left,
    'copyhistory=no',
    'directories=no',
    'menubar=no',
    'resizable=yes',
    'scrollbars=yes',
    'status=no',
    'toolbar=no',
  ].join());
}

function startMeeting() {
  var roomWindow = openWindow();

  eyeson.createRoom(room, user).then(function(response) {
    if (shutdown) {
      var message = 'I just started an eyeson video meeting. ' +
                '<a href="' + response.links.guest_join + '">Join meeting</a>.',
          public = !!parseInt(btn.form.public.value, 10);
      updateTicket(message, public);
    }
    roomWindow.location = response.links.gui;
    shutdown = response.room.shutdown;
    renderSidebar();
  });
}

function renderSidebar() {
  if (shutdown) {
    btn.innerText = 'Start a video meeting';
    txt.style.display = 'block';
  } else {
    btn.innerText = 'Join video meeting';
    txt.style.display = 'none';
  }

  zendesk.invoke('resize', {width: '100%', height: shutdown ? LARGE : SMALL});

  btn.form.style.display = 'block';
}

function updateTicket(message, public) {
  var options = {
    url: '/api/v2/tickets/' + ticket.id + '.json',
    type: 'PUT',
    data: {
      ticket: {
        comment: {
          author_id: user.id,
          html_body: message,
          public: public,
        }
      }
    },
    dataType: 'json'
  };

  zendesk.request(options);
}

zendesk.on('app.registered', function() {
  zendesk.invoke('resize', {width: '100%', height: LARGE});

  zendesk.get(['currentUser', 'ticket']).then(function(data) {
    room = {id: data.ticket.brand.subdomain + '-' + data.ticket.id};
    ticket = data.ticket;
    user = data.currentUser;

    init();
  });
});
