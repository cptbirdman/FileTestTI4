import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { MessageService } from './message.service';
import { Objective } from './objective'

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class ObjectiveService {
	objectivesURL= '/api/objectives';
	/**
	 * Handle Http operation that failed.
	 * Let the app continue.
	 * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {

		// TODO: send the error to remote logging infrastructure
		console.error(error); // log to console instead

		// TODO: better job of transforming error for user consumption
		this.log(`${operation} failed: ${error.message}`);

		// Let the app keep running by returning an empty result.
		return of(result as T);
	  };
	}

	/** Log a HeroService message with the MessageService */
	private log(message: string) {
	  this.messageService.add(`ObjectiveService: ${message}`);
	}
	
	constructor(private http: HttpClient, private messageService: MessageService) { }

	/** GET heroes from the server */
	getObjectives (): Observable<Objective[]> {
	  return this.http.get<Objective[]>(this.objectivesURL)
		.pipe(
		  tap(_ => this.log('fetched objectives')),
		  catchError(this.handleError<Objective[]>('getObjectives', []))
		);
	}
	/** GET objective by id. Will 404 if id not found */
	getObjective(id: number): Observable<Objective> {
	  const url = `${this.objectivesURL}/${id}`;
	  return this.http.get<Objective>(url).pipe(
		tap(_ => this.log(`fetched objective id=${id}`)),
		catchError(this.handleError<Objective>(`getObjective id=${id}`))
	  );
	}
	
	/** POST: add a new objective to the server */
	setObjectives (objective: Objective): Observable<Objective> {
	  return this.http.post<Objective>(this.objectivesURL, objective, httpOptions).pipe(
		tap((newObjective: Objective) => this.log(`added objective w/ id=${newObjective.id}`)),
		catchError(this.handleError<Objective>('addObjective'))
	  );
	}
}
