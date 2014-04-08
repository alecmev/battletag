var battletag = {};

battletag.roots = {
    'main': '#base-container',
    'header': '.dropdown-content[data-for=multiplayer]',
    'friends': '#comcenter-friends',
    'chats': '#comcenter-chats'
};

battletag.clubs = {};
battletag.clubsActive = null;
battletag.clubsChanged = true;
battletag.clubsJSON = null;
battletag.clubsLoading = true;
battletag.personaId = S.globalContext.staticContext.activePersona.personaId;
battletag.retryTime = 5000;
battletag.tag = null;
battletag.tagChanged = true;
battletag.tagField = 'profile-edit-clantag[' + battletag.personaId + '_1_2048]';
battletag.tagLoading = true;
battletag.tagUrl = (
    '/bf4/user/overviewBoxStats/' + 
    S.globalContext.staticContext.activePersona.userId
);
battletag.type = false;

battletag.go = function() {
    battletag.button.click();
    var data = {
        'tab': 'edit-soldiers',
        'profile-edit-personaId[]': battletag.personaId
    };
    data[battletag.tagField] = battletag.selectInput.val();
    $.post('/bf4/profile/update/', data);
    battletag.hide(true);
    if (data[battletag.tagField] != battletag.tag) {
        battletag.tag = data[battletag.tagField];
        battletag.tagChanged = true;
    }

    return false;
};

battletag.selectInput = $('<input>', {
        'type': 'text',
        'maxlength': 4,
        'placeholder': 'CUSTOM TAG'
    }).keypress(function(e) {
        if (!e.which || 8 == e.which) {
            return true;
        }
        else if (13 == e.which) {
            battletag.go();
        }

        return /[A-Za-z0-9]/.test(String.fromCharCode(e.which));
    });

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

    'select': $('<div>', {
            'class': 'battletag-popover battletag-select'
        }).append(
            $('<table>').append(
                $('<tr>').append(
                    $('<td>').append(
                        battletag.selectInput
                    )
                ).append(
                    $('<td>').append(
                        $('<a>', {
                            'href': 'javascript:;',
                            'text': 'go'
                        })
                    ).click(battletag.go)
                ).append(
                    $('<td>').append(
                        $('<a>', {
                            'href': 'javascript:;',
                            'text': '↻'
                        })
                    ).click(function(e) {
                        battletag.clubsLoading = true;
                        battletag.tagLoading = true;
                        battletag.show();
                        battletag.load();
                    })
                )
            )
        )
};

battletag.load = function() {
    $.ajax({
        url: '/bf4/platoons/',
        headers: { 'X-AjaxNavigation': 1 },
        error: battletag.retry,
        success: function(data) {
            battletag.clubsLoading = false;
            var tmpClubsJSON = JSON.stringify(data.context.myclubs);
            if (tmpClubsJSON != battletag.clubsJSON) {
                battletag.clubs = data.context.myclubs;
                battletag.clubsJSON = tmpClubsJSON;
                battletag.clubsChanged = true;
            }

            if (data.context.activeClubId != battletag.clubsActive) {
                battletag.clubsActive = data.context.activeClubId;
                battletag.clubsChanged = true;
            }

            battletag.show();
        }
    });
    $.ajax({
        url: battletag.tagUrl,
        error: battletag.retry,
        success: function(data) {
            battletag.tagLoading = false;
            var tmpTag = '';
            for (var i = 0; i < data.data.soldiersBox.length; ++i) {
                if (2048 == data.data.soldiersBox[i].game) {
                    tmpTag = data.data.soldiersBox[i].persona.clanTag;
                    break;
                }
            }

            if (tmpTag != battletag.tag) {
                battletag.tag = tmpTag;
                battletag.tagChanged = true;
            }

            battletag.show();
        }
    });
};

battletag.retry = function(jqXHR, textStatus, errorThrown) {
    window.setTimeout(function(data) {
            $.ajax(data);
        }, battletag.retryTime, this);
    console.error('BATTLETAG: failed to load ' + this.url);
};

battletag.show = function(type, e) {
    if (type && e) {
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
    if (battletag.clubsLoading || battletag.tagLoading) {
        popover = battletag.popovers.loading;
        if (popover.is(':visible')) {
            return;
        }
    }
    else if (battletag.type == 'preview') {
        popover = battletag.popovers.preview;
        if (battletag.tagChanged) {
            battletag.tagChanged = false;
            popover.empty().append(
                '[' + (battletag.tag.length ? battletag.tag : ' _ ') + ']'
            );
        }
    }
    else {
        popover = battletag.popovers.select;
        battletag.selectInput.val('');
        if (battletag.clubsChanged) {
            battletag.clubsChanged = false;
            popover.children('a').remove();
            for (var club in battletag.clubs) {
                var tmp = $('<a>', {
                        'href': 'javascript:;',
                        'battletag-id': club
                    }).append(
                        $('<font>', {
                            'text': '[' + battletag.clubs[club].tag + ']'
                        })
                    ).append(
                        battletag.clubs[club].name
                    );
                if (club == battletag.clubsActive) {
                    tmp.append(
                        $('<font>', {
                            'class': 'battletag-active',
                            'text': 'ACTIVE'
                        })
                    );
                }

                popover.append(tmp.disableSelection());
            }
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

        var position = tmpParent.position();
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
        'border-color': (
                button.is('.btn-primary, .join-friend-submit-link') ? 
                    '#F90' : '#D5DDE5'
            )
    }).css(
        (data.right ? 'right' : 'left'), (
                data.right ?
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
    if (
        e &&
        !battletag.popovers.select.is(':visible') &&
        !battletag.clubsLoading &&
        !battletag.tagLoading
    ) {
        battletag.type = false;
    }

    battletag.popovers.loading.hide();
    battletag.popovers.preview.hide();
    if (!e || 'preview' != e.data) {
        battletag.popovers.select.hide();
    }
};

battletag.load();

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
    if (!tmptarget.closest('.battletag-select').length) {
        battletag.hide(true);
        return true;
    }

    if (!tmptarget.is('a[battletag-id]')) {
        return true;
    }

    battletag.button.click();
    var clubId = tmptarget.attr('battletag-id');
    $.ajax({
        url: '/bf4/platoons/setActive/' + clubId,
        complete: function(data, status) {
            if (status != 'success') {
                console.log('BATTLETAG: ' + status);
            }
        }
    });
    battletag.hide(true);
    if (clubId != battletag.clubsActive) {
        battletag.clubsActive = clubId;
        battletag.clubsChanged = true;
    }

    var tmpTag = battletag.clubs[clubId].tag;
    if (tmpTag != battletag.tag) {
        battletag.tag = tmpTag;
        battletag.tagChanged = true;
    }

    return false;
});

Push.bind("UserPresenceChanged", function(e) {
    if (battletag.data && battletag.roots['friends'] == battletag.data.root) {
        battletag.hide(true);
    }
});

battletag.openChat = comcenter.openChat;
comcenter.openChat = function(chatId) {
    battletag.hide(true);
    battletag.openChat(chatId);
};

$(battletag.roots['header']).on('mouseleave.battletag', function(e) {
    $('.game-bar .dropdown-bar').css('overflow', '');
    battletag.hide(true);
});
