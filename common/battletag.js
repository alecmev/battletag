var battletag = {};

battletag.popovers = {
    'loading': $('<div>', {
            'class': 'battletag-popover battletag-loading'
        }).append(
            $('<div>', {
                'class': 'loader small alternate'
            })
        ).disableSelection(),

    'preview': $('<div>', {
            'class': 'battletag-popover battletag-preview'
        }).disableSelection(),

    'nopreview': $('<div>', {
            'class': 'battletag-popover battletag-preview',
            'text': '[N/A]'
        }).disableSelection(),

    'select': $('<div>', {
            'class': 'battletag-popover battletag-select'
        }).disableSelection(),

    'noselect': $('<div>', {
            'class': 'battletag-popover battletag-select'
        }).append(
            $('<a>', {
                'href': '/bf4/platoons/',
                'target': '_blank',
                'text': 'NO PLATOONS'
            })
        ).disableSelection()
};

battletag.roots = {
    'main': '#base-container',
    'header': '.dropdown-content[data-for=multiplayer]',
    'friends': '#comcenter-friends',
    'chats': '#comcenter-chats'
};

battletag.club = null;
battletag.clubChanged = true;
battletag.clubs = {};
battletag.clubsChanged = true;
battletag.clubsJSON = null;
battletag.loading = true;
battletag.type = false;

battletag.load = function() {
    $.ajax({
        url: '/bf4/platoons/',
        headers: { 'X-AjaxNavigation': 1 },
        success: function(data) {
            var tmpClubsJSON = JSON.stringify(data.context.myclubs);
            if (tmpClubsJSON != battletag.clubsJSON) {
                battletag.clubs = data.context.myclubs;
                battletag.clubsJSON = tmpClubsJSON;
                battletag.clubsChanged = true;
            }

            if (data.context.activeClubId != battletag.clubs) {
                battletag.club = data.context.activeClubId;
                battletag.clubChanged = true;
            }

            if (battletag.loading) {
                battletag.loading = false;
                battletag.show();
            }
        }
    });
};

battletag.show = function(type, e) {
    if (type) {
        battletag.type = type;
        battletag.data = e.data;
        battletag.button = $(e.target).closest(
            e.data.mapthumb ? '.map-thumb' : '.btn'
        );
        battletag.button.attr('style', 'outline: none !important');
    }
    else if (battletag.type) {
        type = battletag.type;
    }
    else {
        return;
    }

    var button = battletag.button;
    var data = battletag.data;
    var popover = null;

    if (battletag.loading) {
        popover = battletag.popovers.loading;
    }
    else if (battletag.type == 'preview') {
        if (Object.keys(battletag.clubs).length) {
            popover = battletag.popovers.preview;
            if (battletag.clubChanged) {
                battletag.clubChanged = false;
                popover.empty().append(
                    '[' + battletag.clubs[battletag.club].tag + ']'
                );
            }
        }
        else {
            popover = battletag.popovers.nopreview;
        }
    }
    else {
        if (Object.keys(battletag.clubs).length) {
            popover = battletag.popovers.select;
            if (battletag.clubsChanged) {
                battletag.clubsChanged = false;
                popover.empty();
                for (var club in battletag.clubs) {
                    popover.append(
                        $('<a>', {
                            'href': 'javascript:;',
                            'battletag-id': club
                        }).append(
                            $('<div>').append(
                                $('<div>')
                            ).append(
                                $('<div>')
                            ).append(
                                $('<div>')
                            )
                        ).append(
                            $('<font>', {
                                'text': '[' + battletag.clubs[club].tag + ']'
                            })
                        ).append(
                            battletag.clubs[club].name
                        )
                    );
                }
            }
        }
        else {
            popover = battletag.popovers.noselect;
        }
    }

    var top = button.height() + data.offset.y + (data.mapthumb ? 0 : 1);
    var left = data.offset.x;
    var tmpParent = button;
    while (!tmpParent.is(data.root)) {
        if (tmpParent.is('body')) {
            console.error('BATTLETAG: reached body');
            return;
        }

        position = tmpParent.position();
        top += position.top + parseInt(tmpParent.css('margin-top'));
        left += position.left + parseInt(tmpParent.css('margin-left'));
        tmpParent = tmpParent.offsetParent();
    }

    if (battletag.roots['header'] == data.root) {
        $('.game-bar .dropdown-bar').css('overflow', 'visible');
    }

    var tmproot = $(data.root);
    tmproot.append(popover);
    battletag.hide();
    popover.removeAttr('style').css({
        'top': top + 'px',
        'border-color': (button.is('.btn-primary, .join-friend-submit-link') ? 
                '#F90' : '#D5DDE5'
            )
    }).css(
        (data.right ? 'right' : 'left'), (data.right ?
                tmproot.outerWidth() - left - button.outerWidth() : left
            ) + 'px'
    ).show(0);
};

battletag.preview = function(e) {
    battletag.show('preview', e);
    return true;
};

battletag.select = function(e) {
    battletag.show('select', e);
    return false;
};

battletag.hide = function(e) {
    battletag.popovers.loading.hide();
    battletag.popovers.preview.hide();
    battletag.popovers.nopreview.hide();
    if (!e || 'preview' != e.data) {
        battletag.popovers.select.hide();
        battletag.popovers.noselect.hide();
    }
};

battletag.load();
setInterval(battletag.load, 5000);

[
    ['#recommended-server .btn'],
    ['#serverbrowser-recommended-servers .btn', 'main', true, false],
    ['#serverbrowser-results .map-thumb', 'main', false, true, { x:-1, y:0 }],
    ['#serverbrowser-show .btn-block', 'main', true, false],
    ['#server-page-join-buttons .btn-large'],
    ['#play-now-tab-content .btn', 'main', true, false],
    ['.popup-gameinvite-accepted-button .btn'],
    ['#user .profile-playing .btn', 'main', true],
    ['.game-bar .map-thumb', 'header', false, true, { x:-1, y:0 }],
    ['#comcenter-surface-friends .btn', 'friends', true],
    ['#comcenter-chats .join-friend', 'chats', false, false, { x:1, y:1 }],
    ['.comcenter-chat-group .btn', 'chats', false, false, { x:1, y:2 }]
]
.forEach(function(button) {
    var data = {
        'root': battletag.roots[button[1] || 'main'],
        'right': button[2] || false,
        'mapthumb': button[3] || false,
        'offset': button[4] || { x:0, y:0 }
    };
    $(document)
        .on('mouseenter.battletag', button[0], data, battletag.preview)
        .on('mouseleave.battletag', button[0], 'preview', battletag.hide)
        .on('contextmenu.battletag', button[0], data, battletag.select);
});

$(window).on('blur.battletag', battletag.hide);

$(document).on('pageleave.battletag', battletag.hide);

$(document).on('click.battletag', function(e) {
    if (e.button != 0) {
        return true;
    }

    var tmptarget = $(e.target);
    if (!tmptarget.is('a[battletag-id]')) {
        battletag.hide();
        return true;
    }

    battletag.button.click();
    $.ajax({
        url: '/bf4/platoons/setActive/' + tmptarget.attr('battletag-id'),
        complete: function(data, status) {
            if (status != 'success') {
                console.log('BATTLETAG: ' + status);
            }
        }
    });
    battletag.hide();
    return false;
});

Push.bind("UserPresenceChanged", function(e) {
    if (battletag.roots['friends'] == battletag.data.root) {
        battletag.hide();
    }
});

battletag.openChat = comcenter.openChat;
comcenter.openChat = function(chatId) {
    battletag.hide();
    battletag.openChat(chatId);
};

$(battletag.roots['header']).on('mouseleave.battletag', function(e) {
    $('.game-bar .dropdown-bar').css('overflow', '');
    battletag.hide();
});
