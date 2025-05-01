class Observable {

    #value;
    #valueChangedCallback = undefined;

    constructor(value) {
        this.#value = value;
    }

    setValue(value) {
        if(this.#value != value) {
            this.#value = value;
            this.#raiseChangedEvent(value);
        }
    }

    getValue() {
        return this.#value;
    }

    onChange(callback) {
        this.#valueChangedCallback = callback;
    }

    #raiseChangedEvent(v) {
        if(this.#valueChangedCallback) {
            this.#valueChangedCallback(v)
        }
    }
}