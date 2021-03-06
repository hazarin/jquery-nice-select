/*  jQuery Nice Select - v1.1.0
    https://github.com/hernansartorio/jquery-nice-select
    Made by Hernán Sartorio  */

(function($) {

  $.fn.niceSelect = function(method) {

    // Methods
    if (typeof method == 'string') {
      if (method == 'update') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');
          var open = $dropdown.hasClass('open');

          if ($dropdown.length) {
            $dropdown.remove();
            create_nice_select($select);

            if (open) {
              $select.next().trigger('click');
            }
          }
        });
      } else if (method == 'destroy') {
        this.each(function() {
          var $select = $(this);
          var $dropdown = $(this).next('.nice-select');

          if ($dropdown.length) {
            $dropdown.remove();
            $select.css('display', '');
          }
        });
        if ($('.nice-select').length == 0) {
          $(document).off('.nice_select');
        }
      } else {
        console.log('Method "' + method + '" does not exist.')
      }
      return this;
    }

    // Hide native select
    this.hide();

    // Create custom markup
    this.each(function() {
      var $select = $(this);

      if (!$select.next().hasClass('nice-select')) {
        create_nice_select($select);
      }
    });

    function create_nice_select($select) {
      $select.after($('<div></div>')
        .addClass('nice-select')
        .addClass($select.attr('class') || '')
        .addClass($select.attr('disabled') ? 'disabled' : '')
        .attr('tabindex', $select.attr('disabled') ? null : '0')
        .html('<span class="current"></span><div class="filler"></div><ul class="list"></ul>')
      );

      var $dropdown = $select.next();
      var $options = $select.children();
      var $selected = $select.find('option:selected');

      $dropdown.find('.current').html($selected.data('display') || $selected.text());

      $options.each(function(i) {
        var $option = $(this);

        if ($option.prop("tagName") == 'OPTGROUP') {
            var $optgroup = $('<li class="option optgroup"></li>').html($option.attr('label'));
            $dropdown.find('ul:first').append($optgroup);
            var $sublist = $('<ul class="list"></ul>');
            $optgroup.append($sublist);
            $option.children().each(function(i) {
              var $suboption = $(this);
              $sublist.append($('<li></li>')
                  .attr('data-value', $suboption.val())
                  .attr('data-display', null)
                  .addClass('option' +
                  ($suboption.is(':selected') ? ' selected' : '') +
                  ($suboption.is(':disabled') ? ' disabled' : ''))
                  .html($suboption.text())
              );
              // $suboption.trigger('option_change.nice_select');
            })
        } else {
          var $display = $option.data('display');

          if ($display === undefined) {
            $dropdown.find('ul:first').append($('<li></li>')
                .attr('data-value', $option.val())
                .attr('data-display', ($display || null))
                .addClass('option' +
                ($option.is(':selected') ? ' selected' : '') +
                ($option.is(':disabled') ? ' disabled' : ''))
                .html($option.text())
            );
            // $option.trigger('option_change.nice_select');
          } else {
            var $all = $option.parent().children(':selected').length > 1;
            var $revert = $option.data('revert');
            $dropdown.find('ul').append($('<li></li>')
                .attr('data-display', ($display || null))
                .attr('data-revert', $revert)
                .attr('data-all', $all ? 0 : 1)
                .addClass('option' +
                ($option.is(':disabled') ? ' disabled' : ''))
                .html($option.data('text'))
            );
          }
        }

      });
    }

    /* Event listeners */

    // Unbind existing events in case that the plugin has been initialized before
    $(document).off('.nice_select');

    // Open/close
    $(document).on('click.nice_select mouseenter.nice_select', '.nice-select', function(event) {
      var $dropdown = $(this);

      if (event.type === 'mouseenter' && $dropdown.hasClass('open')) {
        return;
      }

      if (event.type === 'click' && $dropdown.prev('select').attr('multiple')) {
        return;
      }

      $('.nice-select').not($dropdown).removeClass('open');
      $dropdown.toggleClass('open');

      if ($dropdown.hasClass('open')) {
        $dropdown.find('.option');
        $dropdown.find('.focus').removeClass('focus');
        $dropdown.find('.selected').addClass('focus');
      } else {
        $dropdown.focus();
      }
    });

    // Close when clicking outside
    $(document).on('click.nice_select', function(event) {
      if ($(event.target).closest('.nice-select').length === 0) {
        $('.nice-select').removeClass('open').find('.option');
      }
    });

    $(document).on('mouseleave.nice_select', 'div.nice-select', function(event) {
      var closest = $(event.target).closest('.nice-select');
      if ($(event.target).closest('.nice-select').length === 1) {
        $('.nice-select').removeClass('open').find('.option');
      }
    });

    // Option click
    $(document).on('click.nice_select', '.nice-select .option:not(.disabled)', function(event) {
      var $option = $(this);
      if ($option.hasClass("optgroup")) {
        return;
      }
      var $dropdown = $option.closest('.nice-select');
      var $select = $dropdown.prev('select');

      if ($select.attr('multiple')) {
        if ($option.data('all') === 1) {
          $option.parent().children('li').each(function(i) {
            var $option = $(this);
            if ($option.hasClass('selected') === false && i > 0) {
              $option.addClass('selected');
              $select.children('option[value="' + $option.data('value') + '"]').
                  prop('selected', true);
              $select.children('option[value="' + $option.data('value') + '"]').
                  trigger('option_change.nice_select');
            }
          })
        }
        if ($option.data('all') === 0) {
          $option.parent().children('li').each(function(i) {
            var $option = $(this);
            if ($option.hasClass('selected') === true && i > 0) {
              $option.removeClass('selected');
              $select.children('option[value="' + $option.data('value') + '"]').
                  prop('selected', false);
              $select.children('option[value="' + $option.data('value') + '"]').
                  trigger('option_change.nice_select');
            }
          })
        }
        if ($option.data('all') === undefined) {
          if ($option.hasClass('selected')) {
            $option.removeClass('selected');
          } else {
            $option.addClass('selected');
          }
          $select.children('option[value="' + $option.data('value') + '"]').prop('selected', $option.hasClass('selected'));
          if ($select.val().length === 1) {
            var $option_all =  $option.parent().children(':first');
            if ($option_all.data('all') === 0) {
              var $inrevert = $option_all.text();
              $option_all.data('all', 1);
              $option_all.text($option_all.data('revert') || null);
              $option_all.data('revert', $inrevert);
            }
          }
          $select.children('option[value="' + $option.data('value') + '"]').trigger('option_change.nice_select');
        } else {
          if ($option.data('all') === 1) {
            $option.data('all', 0);
          } else {
            $option.data('all', 1);
          }
          var $inrevert = $option.text();
          $option.text($option.data('revert') || null);
          $option.data('revert', $inrevert);
        }

      } else {
        $dropdown.find('.selected').removeClass('selected');
        $option.addClass('selected');

        var text = $option.data('display') || $option.text();
        $dropdown.find('.current').text(text);

        $select.val($option.data('value')).trigger('change');
      }
    });

    // Keyboard events
    $(document).on('keydown.nice_select', '.nice-select', function(event) {
      var $dropdown = $(this);
      var $focused_option = $($dropdown.find('.focus') || $dropdown.find('.list .option.selected'));

      // Space or Enter
      if (event.keyCode == 32 || event.keyCode == 13) {
        if ($dropdown.hasClass('open')) {
          $focused_option.trigger('click');
        } else {
          $dropdown.trigger('click');
        }
        return false;
      // Down
      } else if (event.keyCode == 40) {
        if (!$dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        } else {
          var $next = $focused_option.nextAll('.option:not(.disabled)').first();
          if ($next.length > 0) {
            $dropdown.find('.focus').removeClass('focus');
            $next.addClass('focus');
          }
        }
        return false;
      // Up
      } else if (event.keyCode == 38) {
        if (!$dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        } else {
          var $prev = $focused_option.prevAll('.option:not(.disabled)').first();
          if ($prev.length > 0) {
            $dropdown.find('.focus').removeClass('focus');
            $prev.addClass('focus');
          }
        }
        return false;
      // Esc
      } else if (event.keyCode == 27) {
        if ($dropdown.hasClass('open')) {
          $dropdown.trigger('click');
        }
      // Tab
      } else if (event.keyCode == 9) {
        if ($dropdown.hasClass('open')) {
          return false;
        }
      }
    });

    // Detect CSS pointer-events support, for IE <= 10. From Modernizr.
    var style = document.createElement('a').style;
    style.cssText = 'pointer-events:auto';
    if (style.pointerEvents !== 'auto') {
      $('html').addClass('no-csspointerevents');
    }

    return this;

  };

}(jQuery));