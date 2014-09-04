/*
* adapt-name-input
* License - ../LICENSE
* Maintainers - Thomas Taylor <thomas.taylor@kineo.com>
*/
define(function(require) {
    var Adapt = require('coreJS/adapt');
    var nameinput = {
        isOpen: false
    };
    var NameInputView = Backbone.View.extend({
        className: "name-input",

        initialize: function () {
            this.render();
            this.listenTo(Adapt, "remove", this.remove);
        },

        events: {
            'focus .textbox':'onTextboxFocus',
            'blur .textbox':'onTextboxBlur',
            'keyup .textbox': 'onTextboxUpdated',
            'click .submit':'onSubmitClicked'
        },

        render: function () {

            var data = this.model.toJSON();
            var template = Handlebars.templates["adapt-name-input"];
            $(this.el).html(template(data)).appendTo('#wrapper');

            var $input = $('.textbox', this.el);
            $input.val($input.attr('data-value'));
            //$input.focus();
			
			$('.submit').addClass('disabled');
			
            return this;
        },

        // check not undefined or empty space chars
        isInputValid: function() {
            var inputText = this.getUserInput();
            var $input = $('.textbox', this.el);

            var valid = inputText &&
                        inputText !== $input.attr('data-value') &&
                        !(/^\s*$/.test(inputText));

            return valid;
        },

        getUserInput: function() {
            return $(".textbox", this.$el).val();
        },

        /**
         * Event handling
         */

        onTextboxFocus: function() {
            var $input = $('.textbox', this.el);
            if ($input.val() === $input.attr('data-value')) $input.val('');
        },

        onTextboxBlur: function() {
            var $input = $('.textbox', this.el);
            if ($input.val() === '') $input.val($input.attr('data-value'));
        },

        onTextboxUpdated: function(event) {
        	if(event.originalEvent.keyIdentifier === "Enter" && this.isInputValid()) {
        		this.onSubmitClicked();
        		return;
        	}

            if(this.isInputValid()) {
                $('.submit').removeClass('disabled');
                $('.submit').addClass('active');
            } 
            else {
                $('.submit').removeClass('active');
                $('.submit').addClass('disabled');
            }
        },

        onSubmitClicked: function(e) {
            if(e) e.preventDefault();

            if($('.submit').hasClass('active')) {
                Adapt.course.set('_username', this.getUserInput());
                $(this.$el).fadeOut(150, _.bind(this.onAnimOut, this));
            }
        },

        onAnimOut: function() {
            this.remove();
            nameinput.isOpen = false;
            Adapt.trigger("name-input:closed");
        }
    });

    Adapt.on('name-input:open', function(view) {
        if (nameinput.isOpen) return;
        nameinput.isOpen = true;
        new NameInputView({ model: new Backbone.Model(Adapt.course.get('_name-input')) });
    });
    Adapt.once("app:dataReady", function() {
        var settings = Adapt.course.get('_name-input');
        if (settings === undefined) return;
        if (settings._isShowOnInitialize === false) return;
        Adapt.trigger("name-input:open");
    });

    Adapt['name-input'] = nameinput;
});