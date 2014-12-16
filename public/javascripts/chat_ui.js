(function(){
    if (typeof ChatApp == "undefined"){
        window.ChatApp = {};
    }

    var ChatUI = ChatApp.ChatUI = function(socket){

        this.chat = new ChatApp.Chat(socket);
    };

    ChatUI.prototype.getMessage = function($form){
        this.input =  $form.find("textarea#input").val()+ "\n";
    };

    ChatUI.prototype.sendMessage = function(){
        if (this.input[0] !== "/"){
            this.chat.sendMessage(this.input );
        } else {
            this.chat.processCommand(this.input);
        }


    };

    ChatUI.prototype.display = function($space, message){
        $space.append(message);

    };
})();

