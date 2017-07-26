var client = ZAFClient.init();

function init() {
  var start = document.querySelector('button[data-start-button]');

  start.onclick = function() {
    var roomWindow = openWindow();

    client.get(['currentUser', 'ticket']).then(function(data) {
      var createRoom = {
        url: 'https://api.eyeson.team/rooms',
        headers: {'Authorization': '{{setting.api_key}}'},
        data: {
          id: data.ticket.brand.subdomain + '-' + data.ticket.id,
          user: {
            id: data.currentUser.email,
            name: data.currentUser.name,
            avatar: data.currentUser.avatarUrl,
          }
        },
        secure: true,
        type: 'POST',
      };

      client.request(createRoom).then(function(data) {
        roomWindow.location = data.links.gui;
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
