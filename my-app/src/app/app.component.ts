import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { ObjectiveService } from './objective.service'
import { Objective } from './objective'
import { MessageService } from './message.service';
import { SetObjective } from './setobjective'
import { ClaimedObjective } from './claimedobjective'
import { PlayerScore } from './playerscore'
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

	debug = false;
	scores: PlayerScore[] = [];
	claimed: ClaimedObjective[] = [];
	objectives: Objective[] = [];
	objectivesStgOne: Objective[] = [];
	objectivesStgTwo: Objective[] = [];
	chosenObjectivesStgOne: Objective[] = [];
	chosenObjectivesStgTwo: Objective[] = [];
	randoms: any[] = [];

	parseObjectives(): void {
		var objlength = this.objectives.length;
		//this.log(`parsing objectives length=${objlength}`);
		for(var i=0;i<objlength;i++) {
			var nextobj = this.objectives[i];
			if( nextobj.stage == 1 )
			{	
				//this.log(`parsing stg1 objective id=${nextobj.id}`);
				this.objectivesStgOne.push( nextobj );
			}
			else if( nextobj.stage == 2 )
			{
				//this.log(`parsing stg2 objective id=${nextobj.id}`);
				this.objectivesStgTwo.push( nextobj );
			}
		}		
	}
	
	getIsClaimed(color: string, id: number, pos: number) : boolean
	{
		return this.getClaimedPos(color,id) >= 0;
	}

	getClaimedPos(color: string, id: number) : number
	{
		var pos = -1;
		for( var i=0;i<this.claimed.length;i++ )
		{
			var checkrow = color == this.claimed[i].color && id == this.claimed[i].objectiveid;
			if( checkrow )
			{
				pos = this.claimed[i].id;
			}
		}
		return pos;
	}
	
	getUniqueClaimed() : number
	{
		var max = 0;
		for( var i=0;i<this.claimed.length;i++ )
		{
			if( this.claimed[i].id >= max )
			{
				max = this.claimed[i].id + 1;
			}
		}
		return max;
	}
	
	getPlayerScore( color: string ) : PlayerScore 
	{
		for( var i=0;i<this.scores.length;i++ )
		{
			if( this.scores[i].color == color )
			{
				return this.scores[i];
			}
		}
	}
	
	claimobjectivescore(inpscore: PlayerScore, updown: boolean)
	{
		var pscore = this.getPlayerScore(inpscore.color);
		this.log(`firstclaimed color=${pscore.color} points=${pscore.score} and updown=${updown}`);
		var pscorepoints = pscore.score;
		if( pscorepoints == null )
		{
			pscorepoints = 0;
		}
		if( updown )
		{
			var newpoints = pscorepoints + 1;
			if( newpoints < 0 )
			{
				newpoints = 0;
			}
			pscore.score = newpoints;
			this.log(`claimed color=${pscore.color} points=${pscore.points} and updown=${updown}`);
			this.objectiveService.setPlayerScore( pscore ).subscribe();
		}
		else
		{
			var newpoints = pscorepoints - 1;
			if( newpoints < 0 )
			{
				newpoints = 0;
			}
			pscore.score = newpoints;
			this.log(`claimed color=${pscore.color} points=${pscore.points} and updown=${updown}`);
			this.objectiveService.setPlayerScore( pscore ).subscribe();	
		}
	}
	
	claimobjective(ocolor: string, oid: number) {
		var pos = this.getUniqueClaimed();
		var isclaimed = this.getIsClaimed( ocolor, oid, pos );
		if( !isclaimed )
		{
			var claimedObj: ClaimedObjective = {
				id: pos,
				color: ocolor,
				objectiveid: oid
			};
			this.log(`claimed color=${ocolor} and obj=${oid} and pos=${pos} and points=${this.objectives[oid].points}`);
			this.objectiveService.setClaimedObjective(claimedObj)
				.subscribe( newclaimed => this.claimed.push(newclaimed) );
			var pscore = this.getPlayerScore(ocolor);
			var pscorepoints = pscore.score;
			if( pscorepoints == null )
			{
				pscorepoints = 0;
			}
			var newpoints = pscorepoints + this.objectives[oid].points;
			if( newpoints < 0 )
			{
				newpoints = 0;
			}
			pscore.score = newpoints;
			this.objectiveService.setPlayerScore( pscore ).subscribe();
		}
		else
		{
			this.log(`unclaimed color=${ocolor} and obj=${oid} and pos=${pos}`);
			this.objectiveService.deleteClaimedObjective(this.getClaimedPos(ocolor,oid))
				.subscribe(_ => this.getClaimedObjectives() );
			var pscore = this.getPlayerScore(ocolor);
			var pscorepoints = pscore.score;
			if( pscorepoints == null )
			{
				pscorepoints = 0;
			}
			var newpoints = pscorepoints - this.objectives[oid].points;
			if( newpoints < 0 )
			{
				newpoints = 0;
			}
			pscore.score = newpoints;
			this.objectiveService.setPlayerScore( pscore ).subscribe();
		}
	}
	
	getClaimedObjectives()
	{
		this.claimed = [];
		this.objectiveService.getClaimedObjectives()
			.subscribe(objectives => this.claimed = objectives);
	}
	
	getObjectives(): void {
		this.objectiveService.getObjectives()
			.subscribe(objectives => this.objectives = objectives);
		
		this.objectiveService.getSetObjectives()
			.subscribe(objectives => this.processSetObjectives( objectives ) );
	
		this.getClaimedObjectives();
		
		this.objectiveService.getPlayerScores()
			.subscribe(playerscores => this.scores = playerscores);
	}
	
	processSetObjectives( setobjectives: SetObjective[] ) {
		this.chosenObjectivesStgOne = [];
		this.chosenObjectivesStgTwo = [];
		for( var i=0;i<setobjectives.length;i++ )
		{
			if( i < 5 )
			{
				this.chosenObjectivesStgOne.push( this.objectives[setobjectives[i].objectiveid] );
			}
			else
			{
				this.chosenObjectivesStgTwo.push( this.objectives[setobjectives[i].objectiveid] );
			}
		}
	}
	
	test(){
		for( var i=0;i<this.scores.length;i++ )
		{
			this.log( `player=${this.scores[i].color} score=${this.getPlayerScore(this.scores[i].color).score}` );
		}
	}
	
	getRandomStgOneObjective()
	{
		var i = Math.floor((Math.random() * this.objectivesStgOne.length));
		var objqueued = this.objectivesStgOne[i];
		this.chosenObjectivesStgOne.push( objqueued );
		this.objectivesStgOne.splice(i,1);
	}

	getRandomStgTwoObjective()
	{
		var i = Math.floor((Math.random() * this.objectivesStgTwo.length));
		var objqueued = this.objectivesStgTwo[i];
		this.chosenObjectivesStgTwo.push( objqueued );
		this.objectivesStgTwo.splice(i,1);
	}
	
	zeroScore()
	{
		for( var i=0;i<this.scores.length;i++ )
		{
			this.scores[i].score = 0;
			this.objectiveService.setPlayerScore( this.scores[i] ).subscribe();
		}
		
		for( var a=0;a<this.claimed.length;a++ )
		{
			this.objectiveService.deleteClaimedObjective(this.claimed[a].id)
				.subscribe();
		}
		
		this.claimed = [];
	}

	chooseObjectives(): void {
		if( confirm("Are you sure you want to start a new game?") )
		{
			this.chosenObjectivesStgOne = [];
			this.chosenObjectivesStgTwo = [];
			this.objectivesStgOne = [];
			this.objectivesStgTwo = [];
			
			this.parseObjectives();
			
			for(var i=0;i<5;i++) {
				this.getRandomStgOneObjective();
				//this.log(`length of array id=${this.objectivesStgOne.length}`);
			}
			for(var a=0;a<5;a++) {
				this.getRandomStgTwoObjective();
			}
			
			this.setObjectives();
			this.zeroScore();
		}
	}
	
	setObjectives(): void {
		var fullObjs = this.chosenObjectivesStgOne.concat( this.chosenObjectivesStgTwo );
		this.objectiveService.setObjectives(fullObjs);
		//this.objectiveService.addSetObjective(this.chosenobjectives[0]).subscribe();
			//.subscribe();		
	}
	​
	constructor(private http: HttpClient, private objectiveService: ObjectiveService, public messageService: MessageService) {}

	ngOnInit() {
		this.getObjectives();
	}
}