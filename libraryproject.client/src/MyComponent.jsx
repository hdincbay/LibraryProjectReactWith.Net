import React, { Component } from 'react';

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = { data: null };
    }

    componentDidMount() {
        // Bileşen DOM'a eklendiğinde çağrılır
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState) {
        // Bileşenin props veya state'i güncellendiğinde çağrılır
        if (this.state.data !== prevState.data) {
            this.handleDataUpdate();
        }
    }

    componentWillUnmount() {
        // Bileşen DOM'dan kaldırıldığında çağrılır
        this.cleanup();
    }

    fetchData() {
        // Veri çekme işlemleri
        // Örnek: API'den veri çekebilirsiniz
        // this.setState({ data: fetchedData });
    }

    handleDataUpdate() {
        // Veri güncelleme işlemleri
    }

    cleanup() {
        // Temizleme işlemleri
    }

    render() {
        return <div>{this.state.data}</div>;
    }
}

export default MyComponent;
