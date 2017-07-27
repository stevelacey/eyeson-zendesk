var eyeson, start, ticket, ticketField, user, zendesk;

eyeson = {
  request: function(options) {
    if (typeof options === 'string') options = {url: options};
    if (options.url.startsWith('/')) options.url = 'https://api.eyeson.team' + options.url;
    options.headers = {'Authorization': '{{ setting.api_key }}'};
    options.secure = true;
    return zendesk.request(options);
  }
}

zendesk = ZAFClient.init();

function init() {
  start = document.querySelector('button[data-start-button]');
  start.onclick = startMeeting;

  if (ticketField.value.room.shutdown) return;

  checkMeeting();
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

  var createRoom = {
    url: '/rooms',
    type: 'POST',
    data: {
      id: ticket.brand.subdomain + '-' + ticket.id,
      user: {
        id: user.email,
        name: user.name,
        avatar: user.avatarUrl,
      }
    },
  };

  eyeson.request(createRoom).then(function(response) {
    comment = null;

    if (ticketField.value.room.shutdown) {
      comment = {
        author_id: user.id,
        body: 'I just started an eyeson video meeting.',
      }
    }

    ticketField.value = response;
    updateTicket(comment);
    roomWindow.location = ticketField.value.links.gui;
  });
}

function checkMeeting() {
  eyeson.request('/rooms/' + ticketField.value.access_key).then(
    function(response) {
      ticketField.value = response;

      if (!ticketField.value.room.shutdown) {
        start.innerText = 'Join video meeting';
      }

      updateTicket()
    },
    function(response) {
      // gone, probably, emulate a shutdown for now
      ticketField.value.room.shutdown = true;
      updateTicket()
    },
  );
}

function updateTicket(comment) {
  var options = {
    url: '/api/v2/tickets/' + ticket.id + '.json',
    type: 'PUT',
    data: {
      ticket: {
        custom_fields: {
          [ticketField.id]: JSON.stringify(ticketField.value),
        },
      }
    },
    dataType: 'json'
  };

  if (comment) options.data.ticket.comment = comment;

  zendesk.request(options);
}

zendesk.on('app.registered', function() {
  zendesk.invoke('resize', { width: '100%', height: '60px' });

  zendesk.get(['currentUser', 'requirement:eyeson_room', 'ticket']).then(function(data) {
    var requirement = data['requirement:eyeson_room'];

    ticket = data.ticket;
    ticketField = {id: requirement.requirement_id, value: null};
    user = data.currentUser;

    zendesk.invoke('ticketFields:custom_field_' + ticketField.id + '.hide');

    zendesk.get('ticket.customField:custom_field_' + ticketField.id).then(function(data) {
      ticketField.value = JSON.parse(data['ticket.customField:custom_field_' + ticketField.id]);
      init();
    });
  });
});
