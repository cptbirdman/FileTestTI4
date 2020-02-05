import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ObjectiveService } from './objective.service'
import { Objective } from './objective'
import { MessageService } from './message.service';
​
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	private log(message: string) {
		this.messageService.add(`MainApp: ${message}`);
	}
	
	objectives: Objective[] = [];
	chosenObjectives: Objective[] = [];
	randoms: any[] = [];

	getObjectives(): void {
		this.objectiveService.getObjectives()
			.subscribe(objectives => this.objectives = objectives);
	}
	
	getRandomObjective()
	{
		return Math.floor((Math.random() * this.objectives.length));
	}
	
	checkRandomObjective(tocheck: number)
	{
		var check = true;
		for(var i=0;i<this.randoms.length;i++) {
			check = check && this.randoms[i] != tocheck;
		}
		return check;
	}

	chooseObjectives(): void {
		this.chosenObjectives = [];
		this.randoms = [];
		for(var i=0;i<10;i++) {
		  var random = this.getRandomObjective();
		  while( !this.checkRandomObjective(random) )
		  {
			  random = this.getRandomObjective();
		  }
		  this.randoms.push(random);
		  var tempObj = this.objectives[random];
		  this.chosenObjectives.push(tempObj);
		  //this.objectives.splice(i,1);
		}
	}
	
	setObjectives(): void {
		//this.objectiveService.setObjectives()
			//.subscribe();		
	}
	​
	constructor(private http: HttpClient, private objectiveService: ObjectiveService, public messageService: MessageService) {}

	ngOnInit() {
		this.getObjectives();
	}
}