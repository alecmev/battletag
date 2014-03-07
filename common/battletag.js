var battletag = {};

battletag.popoverList = $('<ul>');
battletag.popover = $('<div>', { id: 'battletag-popover' }).append(
    $('<div>').append(
        $('<div>').append(
            battletag.popoverList
        )
    )
);
$('#base-container').append(battletag.popover);
battletag.popoverNeeded = false;

battletag.showPopover = function(button) {
    if (!button.length) {
        return false;
    }

    battletag.button = button;
    battletag.popoverNeeded = true;
    battletag.popoverList.empty();

    $.ajax({
        url: '/bf4/platoons/',
        headers: {
            'X-AjaxNavigation': 1
        },
        success: function(data) {
            if (!battletag.popoverNeeded) {
                return;
            }

            if (!Object.keys(data.context.myclubs).length) {
                battletag.popoverList.append(
                    $('<li>').append(
                        $('<a>', {
                            'href': '/bf4/platoons/',
                            'text': 'YOU HAVE NO PLATOONS'
                        })
                    )
                );
                return;
            }

            for (var tmpClubId in data.context.myclubs) {
                battletag.popoverList.append(
                    $('<li>').append(
                        $('<a>', {
                            'href': 'javascript:;',
                            'data-url':
                                '/bf4/platoons/setActive/' + tmpClubId + '/'
                        }).append(
                            $('<font>', {
                                'text': '[' +
                                        data.context.myclubs[tmpClubId].tag +
                                    ']'
                            })
                        ).append(
                            data.context.myclubs[tmpClubId].name
                        )
                    )
                );
            }
        }
    });

    var position = button.position();
    var top =
        position.top + parseInt(button.css('margin-top')) + button.height() + 1;
    var left =
        position.left + parseInt(button.css('margin-left'));
    var tmpOffsetParent = button.offsetParent();
    while (tmpOffsetParent.attr('id') != 'base-container') {
        if (tmpOffsetParent.is('body')) {
            battletag.popoverNeeded = false;
            console.log('BATTLETAG: reached body');
            return false;
        }

        position = tmpOffsetParent.position();
        top += position.top + parseInt(tmpOffsetParent.css('margin-top'));
        left += position.left + parseInt(tmpOffsetParent.css('margin-left'));
        tmpOffsetParent = tmpOffsetParent.offsetParent();
    }

    battletag.popover.css({
        'top': top + 'px',
        'left': left + 'px'
    }).children().css({
        'border-color': button.is('.btn-primary') ? '#F90' : '#D5DDE5'
    }).end().hide().show(0);

    return true;
}

battletag.hidePopover = function() {
    battletag.popover.hide();
    battletag.popoverNeeded = false;
}

$(document).on('pageleave.battletag', battletag.hidePopover);

$(document).on('click.battletag', function(e) {
    if (e.button == 0) {
        battletag.hidePopover();
    }
});

battletag.popover.on('click.battletag', function(e) {
    if (e.button != 0) {
        return true;
    }

    var tmpTarget = $(e.target);
    var tmpUrl = tmpTarget.attr('data-url');
    if (tmpTarget.is('a') && tmpUrl) {
        battletag.button.click();
        $.ajax({
            url: tmpUrl,
            complete: function(data, status) {
                if (status != 'success') {
                    console.log('BATTLETAG: ' + status);
                }
            }
        });
        battletag.hidePopover();
    }

    return false;
});

$(document).on('contextmenu.battletag', function(e) {
    var tmpTarget = $(e.target);
    var tmpFunc = function(sel, child) {
        return battletag.showPopover(
            child ? tmpTarget.closest(sel).children() : tmpTarget.closest(sel)
        );
    }
    if (
        tmpFunc('#recommended-server .btn') ||
        tmpFunc('#serverbrowser-recommended-servers .btn') ||
        tmpFunc('#serverbrowser-results .map-thumb', true) ||
        tmpFunc('#serverbrowser-show .btn-primary') ||
        tmpFunc('#server-page-join-buttons .btn-primary') ||
        tmpFunc('#play-now-tab-content .btn') ||
        tmpFunc('.popup-gameinvite-accepted-button .btn') ||
        tmpFunc('.profile-playing .btn')
    ) {
        return false;
    }

    return true;
});
