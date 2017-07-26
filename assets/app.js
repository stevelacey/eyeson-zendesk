var client = ZAFClient.init();

function init() {
  var start = document.querySelector('button[data-start-button]');

  start.onclick = function() {
    var roomWindow = openWindow();

    client.get(['currentUser', 'ticket']).then(function(data) {
      var ticket = data.ticket,
          user = data.currentUser;

      var createRoom = {
        url: 'https://api.eyeson.team/rooms',
        headers: {'Authorization': '{{setting.api_key}}'},
        data: {
          id: ticket.brand.subdomain + '-' + ticket.id,
          user: {
            id: user.email,
            name: user.name,
            avatar: user.avatarUrl,
          }
        },
        secure: true,
        type: 'POST',
      };

      client.request(createRoom).then(function(room) {
        var createComment = {
          url: '/api/v2/tickets/' + ticket.id + '.json',
          type: 'PUT',
          data: {
            'ticket': {
              'comment': {
                'author_id': user.id,
                'body': room.links.gui,
              }
            }
          },
          dataType: 'json'
        };

        client.request(createComment);

        roomWindow.location = room.links.gui;
      });
    });
  }
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

client.on('app.registered', function() {
  client.invoke('resize', { width: '100%', height: '60px' });
  init();
});
