import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CacheBucket, HttpCacheManager, withCache } from '@ngneat/cashew';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.scss'],
  standalone: true
})
export class TodosComponent {
  todosBucket = new CacheBucket();

  constructor(
    private http: HttpClient,
    private manager: HttpCacheManager
  ) {}

  getById(id: number) {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        params: { id },
        context: withCache({
          bucket: this.todosBucket
        })
      })
      .subscribe(res => {
        console.log(`Todo ${id}`, res);
      });
  }

  count = 1;
  cachePredicate() {
    this.count++;

    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        params: {
          from: this.count,
          to: Math.random()
        },
        context: withCache({
          key: 'todos',
          clearCachePredicate(prev, current) {
            if (Number(prev?.params.get('from')) > 3) {
              return true;
            }

            return false;
          }
        })
      })
      .subscribe(res => {
        console.log(`cachePredicate`, res);
      });
  }

  loadTodos() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          ttl: 60000
        })
      })
      .subscribe(res => {
        console.log(`Todos`, res);
      });
  }

  loadSimultaneous() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          key: 'Simultaneous'
        })
      })
      .subscribe(res => {
        console.log(`Todos Simultaneous`, res);
      });

    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          key: 'Simultaneous'
        })
      })
      .subscribe(res => {
        console.log(`Todos Simultaneous`, res);
      });
  }

  loadSerially() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          key: 'Serial'
        })
      })
      .pipe(
        tap(res => console.log(`Todos serial response 1`, res)),
        switchMap(() => {
          return this.http.get('https://jsonplaceholder.typicode.com/todos', {
            context: withCache({
              key: 'Serial'
            })
          });
        })
      )
      .subscribe(res => console.log(`Todos serial response 2`, res));
  }

  loadTodoFour() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        params: { id: 4 },
        context: withCache({ ttl: 10000 })
      })
      .subscribe(res => {
        console.log(`Todo 4`, res);
      });
  }

  loadCustomKey() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          key: 'allTodos'
        })
      })
      .subscribe(res => {
        console.log(`allTodos`, res);
      });
  }

  stateManagement() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        context: withCache({
          key: 'testState',
          mode: 'stateManagement'
        })
      })
      .subscribe(res => {
        console.log(`testState`, res);
      });
  }

  dynamicCacheStorage1() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        params: { id: 13 },
        context: withCache({
          key: 'my-id-13',
          storage: 'localStorage',
          version: 'v2'
        })
      })
      .subscribe(res => {
        console.log(`localStorage`, res);
      });
  }

  dynamicCacheStorage2() {
    this.http
      .get('https://jsonplaceholder.typicode.com/todos', {
        params: { id: 13 },
        context: withCache({
          key: 'my-id-13',
          storage: 'memory'
        })
      })
      .subscribe(res => {
        console.log(`memory`, res);
      });
  }

  clearTodosCache() {
    this.manager.delete(this.todosBucket);
  }

  clearCache() {
    this.manager.clear();
  }

  addTodoFive() {
    const response = { id: 5 };
    this.manager.set(`https://jsonplaceholder.typicode.com/todos?id=5`, response);
  }
}
