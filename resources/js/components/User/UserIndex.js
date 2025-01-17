import React from 'react';
import ServerTable from 'react-strap-table';
import { AiFillDelete, AiFillEdit, AiFillPlusSquare, AiFillMinusSquare } from "react-icons/ai";
import { Link } from "react-router-dom";
import Spinner from "../Spinner";
import {
    Header,
    Icon
} from "semantic-ui-react";
import swal from 'sweetalert';

import '../../../css/User.css';

class UserIndex extends React.Component {
    state = {
        selectedUsers: [],
        usersIDs: [],
        isAllChecked: false,
        deleting: false,
        loading: false
    };

    async componentDidMount() {
        // while (this.state.usersIDs.length <= 0) {
        //     await this.sleep(1000)
        // }
        let pageSelect = document.getElementsByTagName("select")[0];
        pageSelect.value = this.props.perPage;
    }

    // sleep = async (msec) => {
    //     return new Promise(resolve => setTimeout(resolve, msec));
    // }

    check_all = React.createRef();

    ServerTable = React.createRef();

    handleCheckboxTableChange = (event) => {
        const value = event.target.value;
        let selectedUsers = this.state.selectedUsers.slice();

        selectedUsers.includes(value) ?
            selectedUsers.splice(selectedUsers.indexOf(value), 1) :
            selectedUsers.push(value);

        this.setState({ selectedUsers: selectedUsers }, () => {
            this.check_all.current.checked = _.difference(this.state.usersIDs, this.state.selectedUsers).length === 0;
        });
    }

    handleCheckboxTableAllChange = (event) => {
        this.setState({ selectedUsers: [...new Set(this.state.selectedUsers.concat(this.state.usersIDs))] }, () => {
            this.check_all.current.checked = _.difference(this.state.usersIDs, this.state.selectedUsers).length === 0;
        });
    }

    handleDelete = async (id) => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you won't be able to recover the data.",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const res = await axios.delete(`${process.env.MIX_API_URL}/users/${id}`);
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    };

    handleDeleteMany = async () => {
        swal({
            title: "Are you sure?",
            text: "Once deleted, you won't be able to recover the data.",
            icon: "warning",
            buttons: ["Cancel", "Delete"],
            dangerMode: true,
        }).then(async (willDelete) => {
            if (willDelete) {
                this.setState({ deleting: true })
                const { selectedUsers } = this.state
                let selectedUserIds = selectedUsers.map(Number);
                const res = await axios.post(`${process.env.MIX_API_URL}/users/deleteMany`, {
                    selectedUserIds: selectedUserIds
                });
                if (res.data.status === 200) {
                    this.setState({ deleting: false })
                }
            }
        });
    }

    render() {
        const { deleting } = this.state;
        let self = this;
        const url = `${process.env.MIX_API_URL}/users`;
        const columns = ['id', 'name', 'email', 'role', 'actions']
        let checkAllInput = (<input type="checkbox" ref={this.check_all} onChange={this.handleCheckboxTableAllChange} />);
        let options = {
            perPage: this.props.perPage,
            perPageValues: [5, 10, 20, 25, 100],
            headings: { id: checkAllInput },
            sortable: ['name', 'email', 'role'],
            requestParametersNames: { query: 'search', direction: 'order' },
            responseAdapter: function (res) {
                let usersIDs = res.data.map(a => a.id.toString());
                self.setState({ usersIDs: usersIDs }, () => {
                    self.check_all.current.checked = _.difference(self.state.usersIDs, self.state.selectedUsers).length === 0;
                });

                return { data: res.data, total: res.total }
            },
            texts: {
                show: 'Users  '
            },
        };
        return (

            <div>
                <Header as='h2' icon textAlign='center'>
                    <Icon name='users' circular />
                    <Header.Content>Users</Header.Content>
                </Header>
                <button className="btn btn-primary create" style={{ marginRight: "8px" }}>
                    <Link to={'users/create'}>
                        <div style={{ color: "white" }} >
                            <AiFillPlusSquare color="white" size="20" style={{ marginBottom: "2px" }} />
                            <span style={{ marginLeft: "8px" }} >
                                Create
                            </span>
                        </div>
                    </Link>
                </button>
                <button className="btn btn-danger delete" onClick={() => { self.handleDeleteMany() }}>
                    <div style={{ color: "white" }} >
                        <AiFillMinusSquare color="white" size="20" style={{ marginBottom: "2px" }} />
                        <span style={{ marginLeft: "8px" }} >
                            Delete Many
                        </span>
                    </div>
                </button>
                {deleting ? <Spinner /> :
                    < ServerTable columns={columns} url={url} options={options} bordered hover ref={this.serverTable}>
                        {
                            function (row, column) {
                                switch (column) {
                                    case 'id':
                                        return (
                                            <input key={row.id.toString()} type="checkbox" value={row.id.toString()}
                                                onChange={self.handleCheckboxTableChange}
                                                checked={self.state.selectedUsers.includes(row.id.toString())} />
                                        );
                                    case 'actions':
                                        return (
                                            <div style={{ display: "flex", justifyContent: "start" }}>
                                                <button className="btn btn-primary" style={{ marginRight: "5px" }}>
                                                    <Link to={'users/' + row.id + '/edit'}>
                                                        <AiFillEdit color="white" style={{ float: "left", marginTop: "4px" }} />
                                                        <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }} >
                                                            Edit
                                                        </div>
                                                    </Link>
                                                </button>
                                                <button className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { self.handleDelete(row.id) }}>
                                                    <AiFillDelete color="white" style={{ float: "left", marginTop: "4px" }} />
                                                    <div style={{ color: "white", float: "left", marginLeft: "3px", paddingBottom: "3px" }}>
                                                        Delete
                                                    </div>
                                                </button>
                                            </div>

                                        );
                                    default:
                                        return (row[column]);
                                }
                            }
                        }
                    </ServerTable >
                }</div>
        );
    }
}

export default UserIndex;