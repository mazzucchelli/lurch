import Callout from './callout';

class login {
    login () {
        $('form.login').submit(e => {
            const form = $(e.currentTarget);
            e.preventDefault();
            var url = form.attr('action');

            form.hide();
            $('.login-spinner').show();
            // clean previous callout messages
            form.find('.callout').remove();

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: data => {
                    $('.login-spinner').hide();
                    form.show();

                    if (data.success) {
                        location.href = data.redirectUrl;
                    } else {
                        console.log(data);
                        Callout.error('Error while logging in', data.error, form);
                    }
                },
                error: data => {
                    if (data.responseJSON.redirectUrl) {
                        window.location.href = data.responseJSON.redirectUrl;
                    } else {
                        $('.login-spinner').hide();
                        form.show();
                    }
                }
            });
            return false;
        });
    }

    register () {
        $('form.registration').submit(e => {
            var form = $(e.currentTarget);
            e.preventDefault();

            var url = form.attr('action');
            form.spinner().start();
            $('form.registration').trigger('login:register', e);

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    form.spinner().stop();
                    // if (!data.success) {
                    //     formValidation(form, data);
                    // } else {
                    //     location.href = data.redirectUrl;
                    // }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }

                    form.spinner().stop();
                }
            });
            return false;
        });
    }

    resetPassword () {
        $('.reset-password-form').submit(function (e) {
            var form = $(this);
            e.preventDefault();
            var url = form.attr('action');
            form.spinner().start();
            $('.reset-password-form').trigger('login:register', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    form.spinner().stop();
                    if (!data.success) {
                        // formValidation(form, data);
                    } else {
                        $('.request-password-title').text(data.receivedMsgHeading);
                        $('.request-password-body').empty()
                            .append('<p>' + data.receivedMsgBody + '</p>');
                        if (!data.mobile) {
                            $('#submitEmailButton').text(data.buttonText)
                                .attr('data-dismiss', 'modal');
                        } else {
                            $('.send-email-btn').empty()
                                .html('<a href="'
                                    + data.returnUrl
                                    + '" class="btn btn-primary btn-block">'
                                    + data.buttonText + '</a>'
                                );
                        }
                    }
                },
                error: function () {
                    form.spinner().stop();
                }
            });
            return false;
        });
    }

    clearResetForm () {
        $('#login .modal').on('hidden.bs.modal', function () {
            $('#reset-password-email').val('');
            $('.modal-dialog .form-control.is-invalid').removeClass('is-invalid');
        });
    }
};

const Login = new login()
export default Login