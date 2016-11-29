import React from 'react';
import {withRouter} from 'react-router';
import {Entity} from '@sketchpixy/rubix/lib/L20n';
import LOStore from 'stores/LOStore';

import {
    Row,
    Col,
    Grid,
    Label,
    Table,
    Form,
    Panel,
    MenuItem,
    PanelBody,
    FormGroup,
    FormControl,
    DropdownButton,
    PanelHeader,
    PanelContainer,

} from '@sketchpixy/rubix';


import LOActionCreator from 'actions/LOActionCreator';

import Quiz from 'components/Quiz';

var XddConstants = require('constants/XddConstants');
var ActionTypes = XddConstants.ActionTypes;

var $tokenbox = null;

var store = require('store');

var xGlobal = require('xGlobal');



@withRouter
export default class NewLO extends React.Component {
  back(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.router.goBack();
  }

  constructor(props) {
    super(props);
    this.state = {
      strings:{
          inputLOName: "Input LO Name",
          addLOContent: "Add LO Content",
          addQuiz: "Add Quiz"
      }
    };
  }
  componentDidMount() {

    LOStore.addChangeListener(this._onLOCallBack);

    $('#wizard-2').steps({
      onStepChanging: function (event, currentIndex, newIndex) {

        $('#form-2').validate().settings.ignore = ':disabled,:hidden';

        if(currentIndex == 1){
          $('#showloname').text($('#lotitle').val());
          $('#showauthor').text(store.get("user_name"));
        }
        return $('#form-2').valid();
      },
      onFinishing: function (event, currentIndex) {
        $('#form-2').validate().settings.ignore = ':disabled';
        return $('#form-2').valid();
      },
      onFinished: function (event, currentIndex) {
        $("#fakeLoader").fakeLoader({
          timeToHide:1000*60*60,
          zIndex:9999999,
          spinner:"spinner3",//Options: 'spinner1', 'spinner2', 'spinner3', 'spinner4', 'spinner5', 'spinner6', 'spinner7' 
          bgColor: "rgba(0, 0, 0, 0.2)" //Hex, RGB or RGBA colors
        });
        LOActionCreator.createLO(store.get('current_course'));
      }
    });

    $('#content').trumbowyg({
      mobile: false,
      tablet: false,
      autogrow: true,
      dir: $('html').attr('dir')
    }).trumbowyg('html', '');

    var tokenContainer = $(this.tokeninputContainer);
    $tokenbox = $('<input />').prop('name', 'tags');
    tokenContainer.append($tokenbox);
    $tokenbox.tokenfield();

    
    var $prerequisitesContainer = $(this.prerequistitsContainer);
    var $prerequisitesbox = $('<input />').prop('name', 'prerequisites');
    $prerequisitesContainer.append($prerequisitesbox);
    $prerequisitesbox.tokenInput(xGlobal.API_HOST + '/api/v1/searchlo',{
        queryParam: "keywords",
        crossDomain: true,
        onResult: function (results) {
            var result = [];
            for (var i = results.length - 1; i >= 0; i--) {
              var tmp = {};
              tmp['id'] = results[i].id;
              tmp['title'] = results[i].title;
              result.push(tmp);
            };
            return result;
        },
        propertyToSearch: 'title',
        resultsFormatter: function(item){ 
          return "<li>"+ item.id + " " + item.title + "</li>";
        },
        noResultsText: "No result found."
      }
    );

    var $categoryContainer = $(this.categoryContainer);
    var $categorybox = $('<input />').prop('name', 'category');
    $categoryContainer.append($categorybox);
    $categorybox.tokenInput(xGlobal.API_HOST + '/api/v1/searchlo',{
        queryParam: "keywords",
        crossDomain: true,
        onResult: function (results) {
            var result = [];
            for (var i = results.length - 1; i >= 0; i--) {
              var tmp = {};
              tmp['id'] = results[i].id;
              tmp['title'] = results[i].title;
              result.push(tmp);
            };
            return result;
        },
        propertyToSearch: 'title',
        resultsFormatter: function(item){ 
          return "<li>"+ item.id + " " + item.title + "</li>";
        },
        noResultsText: "No result found."
      }
    );

    $('.token-input-dropdown').css('z-index',700000);
    $('.token-input-list').css('width','100%');
    $('.token-input-list').css('margin-bottom','15px');
    $('.token-input-list').css('min-height','60px');

  }
	_onLOCallBack(){

    var payload = LOStore.getPayload();
    var result = payload.result;
    if(payload.type == ActionTypes.CREATE_LO){  
      if(result.retcode ==  0){
           // need refactor!!! why child component can not access transitionTo of parent conment
           //this.transitionTo('/teacher/course/new');
           //this.context.router.goBack();
           var courseId = store.get('current_course');
           if(courseId){
              this.transitionTo('/teacher/course/edit/' + courseId);
           }else{
              this.context.router.goBack();
           }
      }else{
        alert(result.message);
      }
    }

  }

  handleSelection(itemprops ){
    var value = itemprops.children;
    alert(value);
  }

  componentWillUnmount() {

      if($.isFunction(this._onLOCallBack)){
        LOStore.removeChangeListener(this._onLOCallBack);
      }
  }
  render() {

    var self = this;

    return (
        <Grid>
          <div id="fakeLoader"></div>
          <Row>
            <Col xs={12} sm={10} className='col-sm-offset-1 padding-col'>
              <PanelContainer>
                <Panel>
                  <PanelHeader style={{margin: 0}}>
                    <Grid>
                      <Row>
                        <Col xs={12}>
                          <h3><Entity entity='addLO' /></h3>
                        </Col>
                      </Row>
                    </Grid>
                  </PanelHeader>
                  <PanelBody>
                    <Form id='form-2'>
                      <div id='wizard-2'>
                        <h1>Name</h1>
                        <div>
                          <Grid>
                            <Row>
                              <Col sm={7} xs={12} collapseLeft xsOnlyCollapseRight>
                                <FormGroup>
                                  <Label htmlFor='coursetitle'>{ self.state.strings.inputLOName } *</Label>
                                  <FormControl type='text' id='lotitle' name='title' className='required' />
                                </FormGroup>
                              </Col>
                              <Col sm={4} xs={6} collapseRight>
                                <p>
                                  <Entity entity='requiredField'/>
                                </p>
                              </Col>
                            </Row>
                          </Grid>
                        </div>

                        <h1>Contents</h1>
                        <div>
                          <Grid>
                            <Row>
                              <Col xs={12} sm={12}>
                                <PanelContainer>
                                  <Panel>
                                    <PanelHeader>
                                      <Grid>
                                        <Row>
                                          <Col xs={12}>
                                              { self.state.strings.addLOContent }
                                          </Col>
                                        </Row>
                                      </Grid>
                                    </PanelHeader>
                                    <PanelBody>
                                      <div id='content' name="content"></div>
                                    </PanelBody>
                                  </Panel>
                                </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                                <PanelContainer>
                                  <Panel>
                                    <PanelHeader>
                                      <Grid>
                                        <Row>
                                          <Col xs={12}>
                                              { self.state.strings.addQuiz }
                                          </Col>
                                        </Row>
                                      </Grid>
                                    </PanelHeader>
                                    <PanelBody>
                                      <Grid id="question-section">
                                        <Quiz quizs={ [] }/>
                                      </Grid>
                                    </PanelBody>
                                  </Panel>
                                </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                               <PanelContainer>
                                <Panel>
                                  <PanelHeader>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <h3 className='text-left'><Entity entity="addLODescription" /></h3>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelHeader>
                                  <PanelBody>
                                     <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <textarea name="description" className="lo-description">
                                          </textarea>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelBody>
                                </Panel>
                               </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                               <PanelContainer>
                                <Panel>
                                  <PanelHeader>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <h3 className='text-left'><Entity entity="selectPrerequists" /></h3>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelHeader>
                                  <PanelBody>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <div ref={(prerequistitsContainer) => self.prerequistitsContainer = prerequistitsContainer}/>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelBody>
                                </Panel>
                               </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                               <PanelContainer>
                                <Panel>
                                  <PanelHeader>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <h3 className='text-left'><Entity entity="selectCategory" /></h3>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelHeader>
                                  <PanelBody>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <div ref={(categoryContainer) => self.categoryContainer = categoryContainer}/>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelBody>
                                </Panel>
                               </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                               <PanelContainer>
                                <Panel>
                                  <PanelHeader>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <h3 className='text-left'><Entity entity="addTag" /></h3>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelHeader>
                                  <PanelBody>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <div ref={(tokeninputContainer) => self.tokeninputContainer = tokeninputContainer}/>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelBody>
                                </Panel>
                               </PanelContainer>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                               <PanelContainer>
                                <Panel className="panel-min-height">
                                  <PanelHeader>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                          <h3 className='text-left'><Entity entity="addLearningLevel" /></h3>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelHeader>
                                  <PanelBody>
                                    <Grid>
                                      <Row>
                                        <Col xs={12}>
                                            <DropdownButton outlined bsStyle="darkorange" dropup
                                                            title="Select grade" id="select_grade"
                                                            onSelect={ self.handleSelection.bind(this) }>
                                              <MenuItem eventKey="1" active>grade 1</MenuItem>
                                              <MenuItem eventKey="2">grade 2</MenuItem>
                                              <MenuItem eventKey="3">grade 3</MenuItem>
                                              <MenuItem eventKey="4">grade 4</MenuItem>
                                              <MenuItem eventKey="5">grade 5</MenuItem>
                                              <MenuItem eventKey="6">grade 6</MenuItem>
                                              <MenuItem eventKey="7">grade 7</MenuItem>
                                              <MenuItem eventKey="8">grade 8</MenuItem>
                                              <MenuItem eventKey="9">grade 9</MenuItem>
                                              <MenuItem eventKey="10">grade 10</MenuItem>
                                              <MenuItem eventKey="11">grade 11</MenuItem>
                                              <MenuItem eventKey="12">grade 12</MenuItem>
                                            </DropdownButton>
                                            <FormControl type="hidden" name='learningLevel'
                                                         defaultValue="1"/>
                                        </Col>
                                      </Row>
                                    </Grid>
                                  </PanelBody>
                                </Panel>
                               </PanelContainer>
                              </Col>
                            </Row>
                          </Grid>
                        </div>
                        <h1>Confirm</h1>
                        <div>
                          <div className=''>
                            <h3><Entity entity='createLOConfirm'/></h3>
                              <Table>
                              <tbody>
                                <tr>
                                  <th> <Entity entity='LOName'/></th>
                                  <td id='showloname'>A learning Object Name</td>
                                </tr>
                                <tr>
                                  <th><Entity entity='author'/></th>
                                  <td id='showauthor'>Otto</td>
                                </tr>
                              </tbody>
                            </Table>                  
                          </div>
                        </div>
                      </div>
                    </Form>
                  </PanelBody>
                </Panel>
              </PanelContainer>
            </Col>
          </Row>
        </Grid>
    );
  }
}