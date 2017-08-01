var eyeson, room, start, ticket, user, zendesk;

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
  start = document.querySelector('button[data-start-button]');
  start.onclick = startMeeting;

  eyeson.getRoom(room).then(
    function(response) {
      if (!response.shutdown) start.innerText = 'Join video meeting';
    },
    function(response) {
      // gone, probably, do nothing
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
  var roomWindow = openWindow(),
      shouldComment = false;

  eyeson.getRoom(room).then(
    function(response) {
      if (response.shutdown) shouldComment = true;
      return eyeson.createRoom(room, user);
    },
    function(response) {
      shouldComment = true;
      return eyeson.createRoom(room, user);
    },
  ).then(function(response) {
    if (shouldComment) updateTicket('I just started an eyeson video meeting.');
    roomWindow.location = response.links.gui;
  });
}

function updateTicket(message) {
  var options = {
    url: '/api/v2/tickets/' + ticket.id + '.json',
    type: 'PUT',
    data: {
      ticket: {
        comment: {
          author_id: user.id,
          body: message,
        }
      }
    },
    dataType: 'json'
  };

  zendesk.request(options);
}

zendesk.on('app.registered', function() {
  zendesk.invoke('resize', { width: '100%', height: '60px' });

  zendesk.get(['currentUser', 'ticket']).then(function(data) {
    room = {id: data.ticket.brand.subdomain + '-' + data.ticket.id};
    ticket = data.ticket;
    user = data.currentUser;

    init();
  });
});
